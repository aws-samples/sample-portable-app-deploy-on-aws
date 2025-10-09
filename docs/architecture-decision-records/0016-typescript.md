# 2. TypeScript Usage

Date: 2024-02-20

## Status

Accepted

## Context

We need to choose a programming language that:
- Is strongly typed
- Has good AWS support
- Offers good productivity
- Has mature tooling

## Decision

Use TypeScript as the main project language.

### Reasons
1. Static typing helps prevent runtime errors
2. Excellent support for AWS SDK and tools
3. Large ecosystem of libraries
4. Good integration with development tools
5. JavaScript compilation allows versatile deployment

## Consequences

### Positive
- Better DX (Developer Experience)
- Fewer runtime errors
- Better tooling (autocomplete, refactoring)
- Implicit documentation through types
- JavaScript compatibility

### Negative
- Compilation requirement
- More complex initial setup
- Learning overhead for JS developers
- Type definition files can be verbose
