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
    provider: 'apple',
    name: 'Apple',
    icon: AppleIcon,
  },
  {
    provider: 'discord',
    name: 'Discord',
    icon: DiscordIcon,
  },
  {
    provider: 'dropbox',
    name: 'Dropbox',
    icon: DropboxIcon,
  },
  {
    provider: 'facebook',
    name: 'Facebook',
    icon: FacebookIcon,
  },
  {
    provider: 'github',
    name: 'GitHub',
    icon: GitHubIcon,
  },
  {
    provider: 'gitlab',
    name: 'GitLab',
    icon: GitLabIcon,
  },
  {
    provider: 'google',
    name: 'Google',
    icon: GoogleIcon,
  },

  {
    provider: 'linkedin',
    name: 'LinkedIn',
    icon: LinkedInIcon,
  },
  {
    provider: 'microsoft',
    name: 'Microsoft',
    icon: MicrosoftIcon,
  },
  {
    provider: 'twitch',
    name: 'Twitch',
    icon: TwitchIcon,
  },
  {
    provider: 'twitter',
    name: 'X',
    icon: XIcon,
  },
] as const;

export type Provider = {
  provider: string;
  name: string;
  icon?: ProviderIcon;
};
