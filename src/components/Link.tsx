import React from 'react';

interface LinkProps {
  href: string;
  children: React.ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, children }) => {
  const isExternalLink = (url: string) => {
    const currentHost = window.location.host;
    const linkHost = new URL(url, window.location.href).host;
    return currentHost !== linkHost;
  };


  return (
    <a
    href={href}
    target={isExternalLink(href) ? '_blank' : '_self'}
    rel={isExternalLink(href) ? 'noopener noreferrer' : ''}
    >
      {children}
    </a>
  );
};

export default Link;
