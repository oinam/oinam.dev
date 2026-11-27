# Progress

How far along something is, on a <progress>.

- Use: `.onm-progress`
- Files: `progress.css`. It is CSS alone, and needs no script.
- Part of Oinam UI. The rules for using it are in `../guide.md`.

`class="onm-progress"` on a `<progress>`, which already knows how far along it is and tells a screen reader so.

```html
<onm-stack gap="2">
  <label for="progress-upload">Uploading the chart</label>
  <progress class="onm-progress" id="progress-upload" value="40" max="100">40%</progress>
</onm-stack>
```
