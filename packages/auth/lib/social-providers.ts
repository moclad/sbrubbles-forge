import {
  AppleIcon,
  DiscordIcon,
  DropboxIcon,
  FacebookIcon,
  GitHubIcon,
  GitLabIcon,
  GoogleIcon,
  LinkedInIcon,
  MicrosoftIcon,
  ProviderIcon,
  TwitchIcon,
  XIcon,
} from '../components/provider-icons';

export const socialProviders = [
  {
    icon: AppleIcon,
    name: 'Apple',
    provider: 'apple',
  },
  {
    icon: DiscordIcon,
    name: 'Discord',
    provider: 'discord',
  },
  {
    icon: DropboxIcon,
    name: 'Dropbox',
    provider: 'dropbox',
  },
  {
    icon: FacebookIcon,
    name: 'Facebook',
    provider: 'facebook',
  },
  {
    icon: GitHubIcon,
    name: 'GitHub',
    provider: 'github',
  },
  {
    icon: GitLabIcon,
    name: 'GitLab',
    provider: 'gitlab',
  },
  {
    icon: GoogleIcon,
    name: 'Google',
    provider: 'google',
  },

  {
    icon: LinkedInIcon,
    name: 'LinkedIn',
    provider: 'linkedin',
  },
  {
    icon: MicrosoftIcon,
    name: 'Microsoft',
    provider: 'microsoft',
  },
  {
    icon: TwitchIcon,
    name: 'Twitch',
    provider: 'twitch',
  },
  {
    icon: XIcon,
    name: 'X',
    provider: 'twitter',
  },
] as const;

export type Provider = {
  provider: string;
  name: string;
  icon?: ProviderIcon;
};
