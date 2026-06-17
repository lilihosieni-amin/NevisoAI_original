import { gql } from '@apollo/client';

export const FOLDERS = gql`
  query Folders {
    folders {
      id
      name
      coverUrl
      color
      noteCount
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_FOLDER = gql`
  mutation CreateFolder($input: CreateFolderInput!) {
    createFolder(input: $input) {
      id
    }
  }
`;

export const UPDATE_FOLDER = gql`
  mutation UpdateFolder($id: ID!, $input: UpdateFolderInput!) {
    updateFolder(id: $id, input: $input) {
      id
    }
  }
`;

export const DELETE_FOLDER = gql`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`;

export const REQUEST_FOLDER_COVER_UPLOAD = gql`
  mutation RequestFolderCoverUpload($contentType: String!, $contentLength: Int) {
    requestFolderCoverUpload(contentType: $contentType, contentLength: $contentLength) {
      uploadUrl
      objectKey
    }
  }
`;
