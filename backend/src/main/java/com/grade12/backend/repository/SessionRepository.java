package com.grade12.backend.repository;

import com.grade12.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByTutorId(Long tutorId);
    List<Session> findByTutorIdOrderByStartTimeAsc(Long tutorId);
    List<Session> findByTutorIdAndStartTimeBetween(Long tutorId, LocalDateTime start, LocalDateTime end);
    List<Session> findByTutorIdAndStartTimeAfterOrderByStartTimeAsc(Long tutorId, LocalDateTime start);
    List<Session> findTop5ByTutorIdOrderByStartTimeDesc(Long tutorId);
    
    @Query("SELECT COUNT(s) FROM Session s WHERE s.tutor.id = :tutorId AND s.status = :status")
    Integer countByTutorIdAndStatus(@Param("tutorId") Long tutorId, @Param("status") String status);
    
    @Query("SELECT COUNT(s) FROM Session s WHERE s.tutor.id = :tutorId AND s.startTime BETWEEN :start AND :end")
    Integer countByTutorIdAndStartTimeBetween(@Param("tutorId") Long tutorId, 
                                              @Param("start") LocalDateTime start, 
                                              @Param("end") LocalDateTime end);
    
    @Query("SELECT s FROM Session s WHERE s.tutor.id = :tutorId AND DATE(s.startTime) = CURRENT_DATE")
    List<Session> findTodaySessions(@Param("tutorId") Long tutorId);
    
    @Query("SELECT s FROM Session s WHERE s.tutor.id = :tutorId AND s.startTime > CURRENT_TIMESTAMP ORDER BY s.startTime ASC")
    List<Session> findUpcomingSessions(@Param("tutorId") Long tutorId);
}