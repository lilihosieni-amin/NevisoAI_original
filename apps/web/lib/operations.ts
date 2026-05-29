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

export const ME = gql`
  query Me {
    me {
      id
      mobile
      displayName
      avatarUrl
      creditBalance
      status
      preferredOtpChannel
      hasPassword
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      displayName
      avatarUrl
      creditBalance
    }
  }
`;
