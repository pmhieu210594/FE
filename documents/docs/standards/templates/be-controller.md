# Template: Backend REST Controller

Location: `EDCAP_BE/src/main/java/com/sdd/platform/web/rest/<Name>Controller.java`

```java
package com.sdd.platform.web.rest;

import com.sdd.platform.application.<domain>.<Name>Service;
import com.sdd.platform.web.dto.<Domain>Dto;
import com.sdd.platform.web.dto.Create<Domain>Request;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/<resources>")
@RequiredArgsConstructor
public class <Name>Controller {

    private final <Name>Service <name>Service;

    @GetMapping
    public List<<Domain>Dto> list() {
        return <name>Service.findAll().stream()
            .map(<Domain>Dto::from)
            .toList();
    }

    @GetMapping("/{id}")
    public <Domain>Dto getById(@PathVariable Long id) {
        return <Domain>Dto.from(<name>Service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public <Domain>Dto create(@RequestBody @Valid Create<Domain>Request req,
                              @AuthenticationPrincipal OAuth2User principal) {
        return <Domain>Dto.from(<name>Service.create(req.toCommand()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        <name>Service.delete(id);
    }
}
```

## Checklist

- [ ] `@RestController` + `@RequestMapping("/api/v1/<resources>")`
- [ ] `@RequiredArgsConstructor` — no field injection
- [ ] Controller is thin: call service, map to DTO, return
- [ ] `@Valid` on request body
- [ ] DTO conversion in controller (or delegated to service)
- [ ] No try/catch — `GlobalExceptionHandler` handles all exceptions
- [ ] No `ResponseEntity` unless status varies dynamically
- [ ] Add `@WebMvcTest` test class alongside
