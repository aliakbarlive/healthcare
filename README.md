# Healthcare company project
## Getting Started

    nvm install
    npm install
    npm start

Use VSCode, install the ESLint extension. The workspace is configured to auto-format and
show lint warnings/errors so that your PR will pass CI.

## File Naming Conventions

1. Uppercase if exports a single (or the file is mainly about a single) component or class
2. Lowercase otherwise

## Styling

We use SASS for CSS, **use it**.

The root content element is `#content`, its styling can be configured with a `useEffect` hook:

```ts
useEffect(() => {
  const el = document.getElementById('content')
  if (!el) return
  el.style.maxWidth = '1200px'
  return () => { el.style.maxWidth = '' }
})
```

So if you need to set the background color or padding of the `#content` element, do it as above.

`#content` has some default rules you may want to override, eg.

```css
#content {
  min-width: 1000px;
  max-width: fit-content;
  padding: 2rem;
  margin: 0 auto;
}
```

## `react-use`

We import `react-use` and it’s pretty great, familiarize yourself with its capabilities:

> https://github.com/streamich/react-use

Note that we motly use `useAsync`, `useAsyncRetry` and `useToggle`.

## `useUser`, `useGroupManager`

We make it easy to get the current user or group-manager, use these functions, **do not**
call the underlying APIs yourself.


Everything else is considered “production” per this document
and code that interprets configuration based on this parameter.

## Configuring Backend

For locahost builds (only) you can set `REACT_APP_PHARAOH`, eg:

    REACT_APP_PHARAOH=http://localhost:8080 npm start

Otherwise Backend is determined based on hostname.

## Configuring the White-Label

Valid White-labels must be in the `white_label` table of
the database.

Label is determined from the group or if that is not available query-string (eg. `?label=jhc`).

## “Environments”

|------------|------------|-----------|
| Env        | RDS        | Pharaoh    |
|------------|------------|------------|
| Develop    | Staging    | Develop    |
| Staging    | Staging    | Staging    |
| Production | Production | Production |
|------------|------------|------------|

This table provided for reference.

## Dependencies To Remove

Possibly:

* react-progress-button (it's useful, but not that fleible, want better)
* react-tooltip (react-datepicker imports popper.js and popper is better)
