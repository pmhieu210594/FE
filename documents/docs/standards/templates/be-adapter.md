# Template: Backend Infrastructure Adapter (Repository)

Location: `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/<Name>RepositoryAdapter.java`

```java
package com.sdd.platform.infrastructure.persistence;

import com.sdd.platform.application.port.out.<Domain>RepositoryPort;
import com.sdd.platform.domain.<Domain>;
import com.sdd.platform.domain.exception.DomainException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class <Domain>RepositoryAdapter implements <Domain>RepositoryPort {

    private final <Domain>Mapper mapper;   // MyBatis mapper interface

    @Override
    public Optional<<Domain>> findById(Long id) {
        return mapper.findById(id);
    }

    @Override
    public List<<Domain>> findAll() {
        return mapper.findAll();
    }

    @Override
    public <Domain> save(<Domain> entity) {
        try {
            if (entity.getId() == null) {
                mapper.insert(entity);   // sets entity.id via useGeneratedKeys
            } else {
                mapper.update(entity);
            }
            return entity;
        } catch (DataAccessException e) {
            // Translate infra exception → domain exception before leaving adapter
            throw new DomainException("Failed to persist <Domain>: " + e.getMessage()) {};
        }
    }

    @Override
    public void deleteById(Long id) {
        mapper.deleteById(id);
    }
}
```

## Corresponding MyBatis Mapper Interface

Location: `EDCAP_BE/src/main/java/com/sdd/platform/infrastructure/persistence/<Domain>Mapper.java`

```java
@Mapper
public interface <Domain>Mapper {
    Optional<<Domain>> findById(Long id);
    List<<Domain>> findAll();
    void insert(<Domain> entity);   // useGeneratedKeys sets id
    void update(<Domain> entity);
    void deleteById(Long id);
}
```

## Corresponding MyBatis XML

Location: `EDCAP_BE/src/main/resources/mapper/<Domain>Mapper.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.sdd.platform.infrastructure.persistence.<Domain>Mapper">

    <sql id="columns">
        id, project_id, name, status, created_at, updated_at
    </sql>

    <select id="findById" resultType="<Domain>">
        SELECT <include refid="columns"/> FROM <table> WHERE id = #{id}
    </select>

    <select id="findAll" resultType="<Domain>">
        SELECT <include refid="columns"/> FROM <table> ORDER BY created_at DESC
    </select>

    <insert id="insert" useGeneratedKeys="true" keyProperty="id">
        INSERT INTO <table> (project_id, name, status)
        VALUES (#{projectId}, #{name}, #{status})
    </insert>

    <update id="update">
        UPDATE <table>
        SET name = #{name}, status = #{status}, updated_at = NOW()
        WHERE id = #{id}
    </update>

    <delete id="deleteById">
        DELETE FROM <table> WHERE id = #{id}
    </delete>

</mapper>
```

## Checklist

- [ ] Adapter `implements` the application port interface
- [ ] `DataAccessException` translated to `DomainException` in `save()`
- [ ] `<sql id="columns">` fragment for SELECT reuse
- [ ] `useGeneratedKeys="true" keyProperty="id"` on insert
- [ ] No Spring `@Transactional` — transaction managed by application service
