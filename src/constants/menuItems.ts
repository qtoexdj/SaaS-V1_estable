import React from 'react';
import {
  HomeOutlined,
  TeamOutlined,
  ProjectOutlined,
  ContactsOutlined,
  NotificationOutlined,
  MessageOutlined,
  UserOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { NavigateFunction } from 'react-router-dom';

type MenuItem = {
  key: string;
  icon?: React.ReactNode;
  label: string;
  onClick?: () => void;
};

export const createBaseMenuItems = (navigate: NavigateFunction): MenuItem[] => [
  {
    key: 'dashboard',
    icon: React.createElement(HomeOutlined),
    label: 'Dashboard',
    onClick: () => navigate('/dashboard'),
  }
];

export const createDevMenuItems = (navigate: NavigateFunction): MenuItem[] => [
  {
    key: 'real-estate',
    icon: React.createElement(HomeOutlined),
    label: 'Inmobiliarias',
    onClick: () => navigate('/dev/real-estate'),
  },
  {
    key: 'users',
    icon: React.createElement(TeamOutlined),
    label: 'Usuarios',
    onClick: () => navigate('/dev/users'),
  },
  {
    key: 'projects',
    icon: React.createElement(ProjectOutlined),
    label: 'Proyectos',
    onClick: () => navigate('/dev/projects'),
  },
  {
    key: 'prospects',
    icon: React.createElement(ContactsOutlined),
    label: 'Prospectos',
    onClick: () => navigate('/dev/prospects'),
  }
];

export const createAdminMenuItems = (navigate: NavigateFunction): MenuItem[] => [
  {
    key: 'users',
    icon: React.createElement(TeamOutlined),
    label: 'Vendedores',
    onClick: () => navigate('/admin/users'),
  },
  {
    key: 'prospects',
    icon: React.createElement(ContactsOutlined),
    label: 'Prospectos',
    onClick: () => navigate('/admin/prospects'),
  },
  {
    key: 'projects',
    icon: React.createElement(ProjectOutlined),
    label: 'Proyectos',
    onClick: () => navigate('/admin/projects'),
  },
  {
    key: 'push-campaigns',
    icon: React.createElement(NotificationOutlined),
    label: 'Campañas Push',
    onClick: () => navigate('/admin/push-campaigns'),
  },
  {
    key: 'chat',
    icon: React.createElement(MessageOutlined),
    label: 'Chat',
    onClick: () => navigate('/admin/chat'),
  },
  {
    key: 'inmobiliaria',
    icon: React.createElement(HomeOutlined),
    label: 'Inmobiliaria',
    onClick: () => navigate('/admin/inmobiliaria'),
  }
];

export const createProfileMenuItem = (navigate: NavigateFunction): MenuItem => ({
  key: 'profile',
  icon: React.createElement(UserOutlined),
  label: 'Perfil',
  onClick: () => navigate('/profile'),
});

export const createUtilityMenuItems = (navigate: NavigateFunction): MenuItem[] => [
  {
    key: 'support',
    icon: React.createElement(QuestionCircleOutlined),
    label: 'Ayuda y Soporte',
    onClick: () => navigate('/support'),
  }
];