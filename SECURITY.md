# Security Policy

## Model

TaskPig operates no servers and stores no user data, login tokens, or task
content anywhere of its own. All traffic goes directly from the user's device
to Google's or the configured AI provider's APIs, and refresh/access tokens
live only in the device's OS-provided credential store.

## Supported versions

Pre-release: only the latest `main` is supported. A versioned support table
will appear with the first release.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting for this repository
(Security tab → Report a vulnerability). Do not open public issues for
security-sensitive reports.

Include: what is affected (desktop/Android, plugin name), impact, and repro
steps or proof of concept. We will acknowledge within a few days and keep the
report private until a fix is available.
