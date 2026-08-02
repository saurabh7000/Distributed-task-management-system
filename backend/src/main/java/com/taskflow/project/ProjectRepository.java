package com.taskflow.project;

import com.taskflow.auth.*;
import com.taskflow.project.*;
import com.taskflow.task.*;
import com.taskflow.realtime.*;
import com.taskflow.audit.*;
import com.taskflow.common.*;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    @Query("SELECT DISTINCT p FROM Project p LEFT JOIN p.members pm WHERE p.owner.id = :userId OR pm.user.id = :userId ORDER BY p.updatedAt DESC")
    List<Project> findAllByUserId(@Param("userId") Long userId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM tasks WHERE project_id = :projectId", nativeQuery = true)
    void deleteTasksByProjectId(@Param("projectId") Long projectId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM board_columns WHERE project_id = :projectId", nativeQuery = true)
    void deleteColumnsByProjectId(@Param("projectId") Long projectId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM project_members WHERE project_id = :projectId", nativeQuery = true)
    void deleteMembersByProjectId(@Param("projectId") Long projectId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM projects WHERE id = :projectId", nativeQuery = true)
    void deleteProjectCascadeById(@Param("projectId") Long projectId);
}

