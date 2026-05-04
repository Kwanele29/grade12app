package com.grade12.backend.repository;

import com.grade12.backend.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    // Find conversation between student and tutor for a specific subject
    @Query("SELECT m FROM ChatMessage m WHERE m.student.id = :studentId AND m.tutor.id = :tutorId AND m.subject.id = :subjectId ORDER BY m.createdAt ASC")
    List<ChatMessage> findConversation(@Param("studentId") Long studentId,
                                       @Param("tutorId") Long tutorId,
                                       @Param("subjectId") Long subjectId);

    // Count unread messages for a tutor (across all subjects)
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.tutor.id = :tutorId AND m.isRead = false")
    Long countUnreadMessagesForTutor(@Param("tutorId") Long tutorId);

    // Find unread messages for a tutor (across all subjects)
    @Query("SELECT m FROM ChatMessage m WHERE m.tutor.id = :tutorId AND m.isRead = false ORDER BY m.createdAt ASC")
    List<ChatMessage> findUnreadMessagesForTutor(@Param("tutorId") Long tutorId);

    // Count unread messages for a student
    @Query("SELECT COUNT(m) FROM ChatMessage m WHERE m.student.id = :studentId AND m.isRead = false")
    Long countUnreadMessagesForStudent(@Param("studentId") Long studentId);
}