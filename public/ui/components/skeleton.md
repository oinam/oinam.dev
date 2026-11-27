# Skeleton

Holds the place of something that is still loading.

- Use: `<onm-skeleton>`
- Files: `skeleton.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-skeleton>` holds the place of something that is still loading. It is a line of text by default; `shape` takes `circle` or `block`.

```html
<onm-stack gap="2" aria-busy="true">
  <onm-skeleton></onm-skeleton>
  <onm-skeleton></onm-skeleton>
  <onm-skeleton shape="block"></onm-skeleton>
</onm-stack>
```

Put `aria-busy="true"` on the container while it loads, and remove it when the content arrives. Set a width in the page's own styles if a line should be shorter than its container.
