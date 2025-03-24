# Shared Directory

This directory contains code shared between the client and server.

## Structure

- `types/`: Shared TypeScript type definitions
- `constants/`: Shared constants and configuration values
- `utils/`: Shared utility functions
- `validation/`: Shared validation logic and schemas

## Usage

Import shared code in both client and server using relative paths:

```typescript
import { SharedType } from '../../shared/types';
import { SHARED_CONSTANT } from '../../shared/constants';
``` 