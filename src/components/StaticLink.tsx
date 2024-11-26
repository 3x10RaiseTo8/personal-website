
const isExternalLink = (url: string) => {
  try {
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    const linkHost = new URL(url, window.location.href).hostname;
    return currentHost !== linkHost;
  } catch {
    return false; // If URL parsing fails, consider it internal
  }
};

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
}

const CustomLink: React.FC<CustomLinkProps> = ({ href, children }) => {
  // Check if the link is external
  const external = isExternalLink(href);

  if (external) {
    // Render an external link with appropriate attributes
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  // Render an internal link using Gatsby's `Link` component
  return <a href={href}>{children}</a>;
};

export default CustomLink;
