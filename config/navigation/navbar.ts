import {
  BookText,
  Download,
  FolderGit2,
  Package,
  Globe,
  FileSearchCorner,
  Megaphone,
  Moon,
  Sun,
  SunMoon,
  TrainTrack,
  HeartHandshake,
  Users,
  Scale,
  Home,
  type LucideIcon,
} from 'lucide-react';
import { PROJECT_COLOR_SCHEMES } from '@/config/theme/colors';

function getHoverColors(
  project: keyof typeof PROJECT_COLOR_SCHEMES,
): NavbarItemColors {
  const scheme = PROJECT_COLOR_SCHEMES[project];
  return {
    light: {
      text: scheme.accentColor.light,
      background: scheme.primaryColor.light,
    },
    dark: {
      text: scheme.accentColor.dark,
      background: scheme.primaryColor.dark,
    },
  };
}

export type NavbarPosition = 'left' | 'right';

export type NavbarItemColors = {
  light: {
    text: string;
    background: string;
  };
  dark: {
    text: string;
    background: string;
  };
};

export type NavbarMaskIcon = {
  type: 'mask';
  src: string;
};

export type NavbarImageIcon = {
  type: 'image';
  src: string;
};

export type NavbarIcon = LucideIcon | NavbarMaskIcon | NavbarImageIcon;

export type NavbarDropdownItem = {
  id: string;
  title?: string;
  href?: string;
  icon?: NavbarIcon;
  colors?: NavbarItemColors;
  color?: NavbarItemColors;
};

export type NavbarItem = {
  id: string;
  title?: string;
  href?: string;
  icon?: NavbarIcon;
  position: NavbarPosition;
  colors?: NavbarItemColors;
  color?: NavbarItemColors;
  dropdown?: NavbarDropdownItem[];
  specialStyle?: NavbarSpecialStyle;
  styleVars?: NavbarStyleVars;
};

export type NavbarSpecialStyle = {
  triggerClassName?: string;
  dropdownContentClassName?: string;
  dropdownItemClassName?: string;
  activeUnderlineClassName?: string;
};

export type NavbarStyleVars = {
  '--instance-accent-light': string;
  '--instance-accent-dark': string;
};

export const NAVBAR_ITEMS: NavbarItem[] = [
  {
    id: 'railyard',
    title: 'Railyard',
    icon: TrainTrack,
    position: 'left',
    colors: getHoverColors('railyard'),
    styleVars: {
      '--instance-accent-light':
        PROJECT_COLOR_SCHEMES['railyard'].accentColor.light,
      '--instance-accent-dark':
        PROJECT_COLOR_SCHEMES['railyard'].accentColor.dark,
    },
    specialStyle: {
      activeUnderlineClassName:
        'absolute inset-x-2 -bottom-[0.38rem] h-1 rounded-full bg-[var(--instance-accent-light)] dark:bg-[var(--instance-accent-dark)]',
    },
    dropdown: [
      {
        id: 'railyard-download',
        title: 'Download',
        href: '/railyard',
        icon: Download,
        colors: getHoverColors('railyard'),
      },
      {
        id: 'railyard-browse',
        title: 'Browse',
        href: '/railyard/browse',
        icon: FileSearchCorner,
        colors: getHoverColors('railyard'),
      },
      {
        id: 'railyard-world-map',
        title: 'World Map',
        href: '/railyard/world-map',
        icon: Globe,
        colors: getHoverColors('railyard'),
      },
      {
        id: 'railyard-docs',
        title: 'Docs',
        href: '/railyard/docs',
        icon: BookText,
        colors: getHoverColors('railyard'),
      },
      {
        id: 'railyard-updates',
        title: 'Updates',
        href: '/railyard/updates',
        icon: Megaphone,
        colors: getHoverColors('railyard'),
      },
    ],
  },
  {
    id: 'template-mod',
    title: 'Template Mod',
    icon: Package,
    position: 'left',
    colors: getHoverColors('template-mod'),
    styleVars: {
      '--instance-accent-light':
        PROJECT_COLOR_SCHEMES['template-mod'].accentColor.light,
      '--instance-accent-dark':
        PROJECT_COLOR_SCHEMES['template-mod'].accentColor.dark,
    },
    specialStyle: {
      activeUnderlineClassName:
        'absolute inset-x-2 -bottom-[0.38rem] h-1 rounded-full bg-[var(--instance-accent-light)] dark:bg-[var(--instance-accent-dark)]',
    },
    dropdown: [
      {
        id: 'template-mod-home',
        title: 'Home',
        href: '/template-mod',
        icon: Home,
        colors: getHoverColors('template-mod'),
      },
      {
        id: 'template-mod-docs',
        title: 'Docs',
        href: '/template-mod/docs',
        icon: BookText,
        colors: getHoverColors('template-mod'),
      },
      {
        id: 'template-mod-updates',
        title: 'Updates',
        href: '/template-mod/updates',
        icon: Megaphone,
        colors: getHoverColors('template-mod'),
      },
    ],
  },
  {
    id: 'community',
    title: 'Community',
    href: 'https://discord.gg/syG9YHMyeG',
    icon: HeartHandshake,
    position: 'right',
    dropdown: [
      {
        id: 'credits',
        title: 'Credits',
        href: '/credits',
        icon: Users,
      },
      {
        id: 'license',
        title: 'License',
        href: '/license',
        icon: Scale,
      },
    ],
  },
  {
    id: 'discord',
    title: 'Discord',
    href: 'https://discord.gg/syG9YHMyeG',
    icon: {
      type: 'mask',
      src: '/assets/discord.svg',
    },
    position: 'right',
    dropdown: [
      {
        id: 'subway-builder',
        title: 'Subway Builder',
        href: 'https://discord.gg/jrNQpbytUQ',
        icon: {
          type: 'image',
          src: '/assets/subway-builder.svg',
        },
      },
      {
        id: 'Subway-Builder-Modded',
        title: 'Subway Builder Modded',
        href: 'https://discord.gg/syG9YHMyeG',
        icon: TrainTrack,
      },
    ],
  },
  {
    id: 'github',
    title: 'GitHub',
    href: 'https://github.com/Subway-Builder-Modded',
    icon: {
      type: 'mask',
      src: '/assets/github.svg',
    },
    position: 'right',
    dropdown: [
      {
        id: 'railyard',
        title: 'Railyard',
        href: 'https://github.com/Subway-Builder-Modded/railyard',
        icon: TrainTrack,
        colors: getHoverColors('railyard'),
      },
      {
        id: 'registry',
        title: 'Registry',
        href: 'https://github.com/Subway-Builder-Modded/The-Railyard',
        icon: FolderGit2,
        colors: getHoverColors('registry'),
      },
      {
        id: 'template-mod',
        title: 'Template Mod',
        href: 'https://github.com/Subway-Builder-Modded/template-mod',
        icon: Package,
        colors: getHoverColors('template-mod'),
      },
      {
        id: 'website',
        title: 'Website',
        href: 'https://github.com/Subway-Builder-Modded/website',
        icon: Globe,
        colors: getHoverColors('website'),
      },
    ],
  },
  {
    id: 'theme',
    title: 'Theme',
    position: 'right',
    icon: SunMoon,
    dropdown: [
      {
        id: 'theme-light',
        title: 'Light',
        icon: Sun,
        colors: {
          light: {
            text: '#B06710',
            background: '#FFD26055',
          },
          dark: {
            text: '#FFD260',
            background: '#B0671055',
          },
        },
      },
      {
        id: 'theme-dark',
        title: 'Dark',
        icon: Moon,
        colors: {
          light: {
            text: '#4776CC',
            background: '#2DB7E055',
          },
          dark: {
            text: '#2DB7E0',
            background: '#4776CC55',
          },
        },
      },
      {
        id: 'theme-system',
        title: 'System',
        icon: SunMoon,
        colors: {
          light: {
            text: '#B06710',
            background: '#FFD26055',
          },
          dark: {
            text: '#2DB7E0',
            background: '#4776CC55',
          },
        },
      },
    ],
  },
];
