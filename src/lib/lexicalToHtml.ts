// Simple Lexical JSON AST to HTML Converter for Astro
import { getMediaUrl } from "./payload";

export function lexicalToHtml(node: any): string {
    if (!node) return "";

    // Handle root node which wraps everything
    if (node.root) {
        return node.root.children.map((child: any) => lexicalToHtml(child)).join("");
    }

    if (node.type === "text") {
        let text = escapeHtml(node.text);
        
        // Lexical formats are bitwise (1=bold, 2=italic, 4=strikethrough, 8=underline, 16=code)
        if (node.format & 1) text = `<strong>${text}</strong>`;
        if (node.format & 2) text = `<em>${text}</em>`;
        if (node.format & 4) text = `<s>${text}</s>`;
        if (node.format & 8) text = `<u>${text}</u>`;
        if (node.format & 16) text = `<code>${text}</code>`;
        
        return text;
    }

    if (node.type === "paragraph") {
        return `<p>${renderChildren(node)}</p>`;
    }

    if (node.type === "heading") {
        const tag = node.tag || "h2";
        return `<${tag}>${renderChildren(node)}</${tag}>`;
    }

    if (node.type === "list") {
        const tag = node.listType === "number" ? "ol" : "ul";
        return `<${tag} class="list-disc pl-5 my-4">${renderChildren(node)}</${tag}>`;
    }

    if (node.type === "listitem") {
        return `<li>${renderChildren(node)}</li>`;
    }

    if (node.type === "quote") {
        return `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${renderChildren(node)}</blockquote>`;
    }

    if (node.type === "link") {
        const url = node.fields?.url || node.url || "#";
        const newTab = node.fields?.newTab ? ' target="_blank" rel="noopener noreferrer"' : '';
        return `<a href="${url}"${newTab}>${renderChildren(node)}</a>`;
    }

    if (node.type === "upload") {
        const val = node.value;
        if (!val) return "";
        const url = getMediaUrl(val.url);
        return `<img src="${url}" alt="${val.alt || ''}" class="w-full h-auto my-4 rounded-xl" />`;
    }

    // Fallback for unknown nodes
    if (node.children) {
        return renderChildren(node);
    }

    return "";
}

function renderChildren(node: any): string {
    if (!node.children || !Array.isArray(node.children)) return "";
    return node.children.map((child: any) => lexicalToHtml(child)).join("");
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
