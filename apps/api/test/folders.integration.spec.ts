import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';
import { TokenService } from '../src/auth/token.service';

/**
 * Step 3 integration tests (DEVELOPMENT_PLAN §3): folder CRUD is strictly
 * owner-scoped — user B cannot see/update/delete user A's folder; a cover key
 * outside the caller's prefix is rejected; an empty folder deletes. Requires
 * docker Postgres.
 */
describe('Step 3 folders (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let tokenA: string;
  let tokenB: string;
  let userA: string;
  let userB: string;

  const MOBILE_A = '9120000031';
  const MOBILE_B = '9120000032';

  const gql = (query: string, variables: unknown, token: string) =>
    request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({ query, variables });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);
    const tokens = app.get(TokenService);

    await cleanup();
    const a = await prisma.user.create({ data: { mobile: MOBILE_A, status: 'ACTIVE' } });
    const b = await prisma.user.create({ data: { mobile: MOBILE_B, status: 'ACTIVE' } });
    userA = a.id;
    userB = b.id;
    tokenA = (await tokens.issue(userA)).accessToken;
    tokenB = (await tokens.issue(userB)).accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await app?.close();
  });

  async function cleanup() {
    await prisma.folder.deleteMany({ where: { user: { mobile: { in: [MOBILE_A, MOBILE_B] } } } });
    await prisma.user.deleteMany({ where: { mobile: { in: [MOBILE_A, MOBILE_B] } } });
  }

  const CREATE = `mutation($input: CreateFolderInput!){ createFolder(input:$input){ id } }`;
  const LIST = `query{ folders{ id name color noteCount } }`;
  const UPDATE = `mutation($id: ID!, $input: UpdateFolderInput!){ updateFolder(id:$id, input:$input){ id } }`;
  const DELETE = `mutation($id: ID!){ deleteFolder(id:$id) }`;

  it('creates an owner-scoped folder with a persisted color + noteCount 0', async () => {
    const res = await gql(CREATE, { input: { name: 'ریاضی ۱', color: '#455A8F' } }, tokenA).expect(200);
    const id = res.body.data.createFolder.id;
    expect(id).toBeTruthy();

    const list = await gql(LIST, {}, tokenA).expect(200);
    const mine = list.body.data.folders.find((f: { id: string }) => f.id === id);
    expect(mine).toMatchObject({ name: 'ریاضی ۱', color: '#455A8F', noteCount: 0 });

    // User B cannot see it.
    const listB = await gql(LIST, {}, tokenB).expect(200);
    expect(listB.body.data.folders.find((f: { id: string }) => f.id === id)).toBeUndefined();
  });

  it("blocks another user from updating/deleting (FOLDER_NOT_FOUND)", async () => {
    const created = await gql(CREATE, { input: { name: 'فیزیک' } }, tokenA).expect(200);
    const id = created.body.data.createFolder.id;

    const upd = await gql(UPDATE, { id, input: { name: 'هک' } }, tokenB).expect(200);
    expect(upd.body.errors[0].extensions.code).toBe('FOLDER_NOT_FOUND');

    const del = await gql(DELETE, { id }, tokenB).expect(200);
    expect(del.body.errors[0].extensions.code).toBe('FOLDER_NOT_FOUND');
  });

  it('rejects a cover key outside the caller prefix (FORBIDDEN)', async () => {
    const res = await gql(
      CREATE,
      { input: { name: 'با کاور', coverUrl: `users/${userB}/covers/x.jpg` } },
      tokenA,
    ).expect(200);
    expect(res.body.errors[0].extensions.code).toBe('FORBIDDEN');
  });

  it('updates own folder (rename + recolor)', async () => {
    const created = await gql(CREATE, { input: { name: 'قدیمی', color: '#E8A53D' } }, tokenA).expect(200);
    const id = created.body.data.createFolder.id;
    await gql(UPDATE, { id, input: { name: 'جدید', color: '#B0413E' } }, tokenA).expect(200);
    const list = await gql(LIST, {}, tokenA).expect(200);
    expect(list.body.data.folders.find((f: { id: string }) => f.id === id)).toMatchObject({
      name: 'جدید',
      color: '#B0413E',
    });
  });

  it('deletes an empty folder', async () => {
    const created = await gql(CREATE, { input: { name: 'موقت' } }, tokenA).expect(200);
    const id = created.body.data.createFolder.id;
    const del = await gql(DELETE, { id }, tokenA).expect(200);
    expect(del.body.data.deleteFolder).toBe(true);
    const list = await gql(LIST, {}, tokenA).expect(200);
    expect(list.body.data.folders.find((f: { id: string }) => f.id === id)).toBeUndefined();
  });
});
