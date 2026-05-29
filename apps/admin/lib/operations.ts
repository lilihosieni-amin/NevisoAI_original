import { gql } from '@apollo/client';

export const ADMIN_LOGIN_STEP1 = gql`
  mutation AdminLoginStep1($email: String!, $password: String!) {
    adminLoginStep1(email: $email, password: $password) {
      challengeId
      expiresIn
      maskedMobile
    }
  }
`;

export const ADMIN_LOGIN_STEP2 = gql`
  mutation AdminLoginStep2($challengeId: ID!, $code: String!) {
    adminLoginStep2(challengeId: $challengeId, code: $code) {
      accessToken
      admin {
        id
        email
        displayName
        role
      }
    }
  }
`;

export const ADMIN_REFRESH = gql`
  mutation AdminRefreshToken {
    adminRefreshToken {
      accessToken
      admin {
        id
        email
        displayName
        role
      }
    }
  }
`;

export const ADMIN_LOGOUT = gql`
  mutation AdminLogout {
    adminLogout
  }
`;

export const ADMIN_ME = gql`
  query AdminMe {
    adminMe {
      id
      email
      displayName
      role
    }
  }
`;
