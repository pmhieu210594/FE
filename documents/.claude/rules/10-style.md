# 10 — Style Rules

## Backend (Java / Spring Boot)

- Domain models: use `@Builder @Getter @Setter @NoArgsConstructor @AllArgsConstructor`; never `@Data`
- Injection: constructor injection only; no `@Autowired` field injection
- Transactions: `@Transactional` on `@Service` methods; never on repository adapters or controllers
- Exceptions: translate infrastructure exceptions to domain exceptions before leaving the adapter layer
- DTOs: convert domain → DTO in the service layer (or a dedicated mapper); controllers stay thin

## Frontend (TypeScript / React)

- Exports: named exports for all modules; no default exports
- Components: `React.forwardRef` + `displayName` on every reusable UI component
- Classnames: `cn()` from `lib/utils` for all Tailwind class merging (not raw `clsx` or string concat)
- TypeScript: no `any`; no unchecked `as` cast without an inline `// reason:` comment
- Hooks: return objects with named properties, not tuples
- Variants: use CVA (`class-variance-authority`) for component style variants

→ See [docs/standards/coding.md](../docs/standards/coding.md) for full examples and rationale.
