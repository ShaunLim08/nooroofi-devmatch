'use client';

import React, { useState } from 'react';
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavItems,
  MobileNavToggle,
  NavbarLogo,
} from './resizable-navbar';

const NoorooNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: 'Home',
      link: '/',
    },
    {
      name: 'Market',
      link: '/market',
    },
    {
      name: 'Profile',
      link: '/profile',
    },
  ];

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMobileMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <Navbar className="top-2">
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={isOpen} onClick={toggleMobileMenu} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={closeMobileMenu}>
            <MobileNavItems items={navItems} onItemClick={closeMobileMenu} />
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
    </div>
  );
};

export default NoorooNavbar;
