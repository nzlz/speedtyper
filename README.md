<br>
<div align="center">
  <a href="https://github.com/nzlz/speedtyper.dev" target="_blank">
    <img src="packages/webapp-next/public/logo.png" alt="Speedtyper (Local Edition)" height="100" width="auto"/>
  </a>
  <h1><i>speedtyper - offline</i></h1>
</div>

<p align="center">
  <b>
      Master the syntax of codebases of your choice - fully offline 🧑‍💻
  </b>
</p>

<div align="center">
  <img src="demo.gif" width="70%" alt="Demo of speedtyper-offline" />
</div>

## About

This is a local-only fork of [speedtyper.dev](https://github.com/codicocodes/speedtyper.dev), optimized for offline usage. All cloud functionality has been removed, allowing you to:

- Practice typing code with your own repositories and master special characters
- Use it anytime, anywhere without internet connectivity
- No usage limitations or data restrictions

## How to Use

1. Start the application with Docker (required):
   ```
   docker compose up
   ```

2. Open [http://localhost:3001/](http://localhost:3001/) in your browser.

3. That's it! You're ready to practice.

To customize your practice repositories, edit the `.repos` file in the root directory with the GitHub repositories you're interested in.

## Disclaimer

The code in this repository does not represent any coding standard or quality code. It was quickly iterated over with [Cursor](https://cursor.sh) editor and is provided as-is primarily for functionality.

## License

This fork follows the original speedtyper.dev's [MIT](https://github.com/codicocodes/speedtyper.dev/blob/main/LICENSE) license.
