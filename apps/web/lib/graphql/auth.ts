import { gql } from '@apollo/client';

export const OTP_CHANNELS = gql`
  query OtpChannels {
    otpChannels
  }
`;

export const REQUEST_OTP = gql`
  mutation RequestOtp($mobile: String!, $channel: OtpChannel) {
    requestOtp(mobile: $mobile, channel: $channel) {
      expiresIn
      channel
    }
  }
`;

export const VERIFY_OTP = gql`
  mutation VerifyOtp($mobile: String!, $code: String!) {
    verifyOtp(mobile: $mobile, code: $code) {
      accessToken
      isNewUser
    }
  }
`;

export const LOGIN = gql`
  mutation Login($mobile: String!, $password: String!) {
    login(mobile: $mobile, password: $password) {
      accessToken
      isNewUser
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation RefreshToken {
    refreshToken {
      accessToken
      isNewUser
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($newPassword: String!, $currentPassword: String) {
    changePassword(newPassword: $newPassword, currentPassword: $currentPassword)
  }
`;

export const MY_CREDITS = gql`
  query MyCredits {
    myCredits
  }
`;
