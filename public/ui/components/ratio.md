# Ratio

Keeps a picture, a video, or a frame to a fixed shape.

- Use: `<onm-ratio>`
- Files: `ratio.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`<onm-ratio>` keeps a picture, a video, or a frame to a fixed shape, and crops it to fit. It is 16 by 9 unless `ratio` says `4/3`, `1/1`, or `21/9`.

```html
<onm-ratio ratio="4/3">
  <img src="/harbor.jpg" alt="The harbor at low water" />
</onm-ratio>
```
