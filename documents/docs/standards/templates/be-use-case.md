# Template: Backend Use Case (Application Service)

Location: `EDCAP_BE/src/main/java/com/sdd/platform/application/<domain>/<Name>Service.java`

```java
package com.sdd.platform.application.<domain>;

import com.sdd.platform.application.port.out.<Domain>RepositoryPort;
import com.sdd.platform.domain.<Domain>;
import com.sdd.platform.domain.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class <Name>Service {

    // Inject ports (interfaces), never adapters
    private final <Domain>RepositoryPort <domain>Repo;

    @Transactional(readOnly = true)
    public <Domain> findById(Long id) {
        return <domain>Repo.findById(id)
            .orElseThrow(() -> new NotFoundException("<Domain> not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<<Domain>> findAll() {
        return <domain>Repo.findAll();
    }

    @Transactional
    public <Domain> create(Create<Domain>Command cmd) {
        var entity = <Domain>.builder()
            // map command fields
            .build();
        return <domain>Repo.save(entity);
    }

    @Transactional
    public <Domain> update(Long id, Update<Domain>Command cmd) {
        var entity = findById(id);
        // apply changes
        return <domain>Repo.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        findById(id);  // verify exists, throws NotFoundException if not
        <domain>Repo.deleteById(id);
    }
}
```

## Checklist

- [ ] `@Service` + `@RequiredArgsConstructor`
- [ ] Constructor injects port interfaces (not adapters)
- [ ] Read methods: `@Transactional(readOnly = true)`
- [ ] Write methods: `@Transactional`
- [ ] Uses `NotFoundException` from `domain.exception`
- [ ] No `ResponseEntity` or HTTP concerns
- [ ] One test class `<Name>ServiceTest` mocking the ports
