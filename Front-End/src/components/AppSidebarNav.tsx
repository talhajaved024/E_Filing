import React, { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

import { CBadge } from '@coreui/react';

interface BadgeProps {
  color: string;
  text: string;
}

interface ItemProps {
  component: any; // Replace `any` with the actual type
  name?: string;
  badge?: BadgeProps;
  icon?: ReactNode;
  to?: string;
  items?: ItemProps[];
  [key: string]: any; // for additional properties not defined
}

interface AppSidebarNavProps {
  items: ItemProps[];
}

export const AppSidebarNav: React.FC<AppSidebarNavProps> = ({ items }) => {
  const location = useLocation()
  const navLink = (name?: string, icon?: ReactNode, badge?: BadgeProps) => {
    return (
      <>
        {icon && icon}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item: ItemProps, index: number) => {
    const { component, name, badge, icon, ...rest } = item
    const Component = component
    return (
      <Component
        {...(rest.to &&
          !rest.items && {
            component: NavLink,
          })}
        key={index}
        {...rest}
      >
        {navLink(name, icon, badge)}
      </Component>
    )
  }
  const navGroup = (item: ItemProps, index: number) => {
    const { component, name, icon, to, ...rest } = item
    const Component = component
    return (
      <Component
        idx={String(index)}
        key={index}
        toggler={navLink(name, icon)}
        visible={to ? location.pathname.startsWith(to) : false}
        {...rest}
      >
        {item.items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index),
        )}
      </Component>
    )
  }

  return (
    <React.Fragment>
      {items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </React.Fragment>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
};
