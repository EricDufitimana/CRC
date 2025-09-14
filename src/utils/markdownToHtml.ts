import { remark } from "remark";
import html from "remark-html";

export default async function markdownToHtml(markdown: string) {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(markdown);
  
  // Post-process the HTML to add link styling
  let htmlContent = result.toString();
  
  // Add classes and attributes to all links
  htmlContent = htmlContent.replace(
    /<a\s+([^>]*?)href="([^"]*?)"([^>]*?)>/g,
    (match, before, href, after) => {
      // Check if it's an external link
      const isExternal = href.startsWith('http://') || href.startsWith('https://');
      
      // Extract existing class attribute
      const classMatch = match.match(/class="([^"]*?)"/);
      const existingClass = classMatch ? classMatch[1] : '';
      
      // Build new attributes
      let newAttrs = before + after;
      
      // Add target and rel for external links
      if (isExternal) {
        newAttrs += ' target="_blank" rel="noopener noreferrer"';
      }
      
      // Add styling classes
      const linkClasses = 'text-blue-200 hover:text-blue-100 font-medium underline  transition-all duration-200';
      const finalClass = existingClass ? `${existingClass} ${linkClasses}` : linkClasses;
      newAttrs += ` class="${finalClass}"`;
      
      return `<a href="${href}"${newAttrs}>`;
    }
  );
  
  return htmlContent;
}
