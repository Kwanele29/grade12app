package com.grade12.backend.repository;

import com.grade12.backend.model.ChatMessage;
import com.grade12.backend.model.User;
import com.grade12.backend.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    
    List<ChatMessage> findByStudentAndSubjectOrderByCreatedAtAsc(User student, Subject subject);
    
    List<ChatMessage> findByTutorAndSubjectOrderByCreatedAtAsc(User tutor, Subject subject);
    
    List<ChatMessage> findBySubjectOrderByCreatedAtAsc(Subject subject);
    
    @Query("SELECT c FROM ChatMessage c WHERE (c.student.id = :studentId AND c.tutor.id = :tutorId AND c.subject.id = :subjectId) OR (c.student.id = :tutorId AND c.tutor.id = :studentId AND c.subject.id = :subjectId) ORDER BY c.createdAt ASC")
    List<ChatMessage> findConversation(@Param("studentId") Long studentId, @Param("tutorId") Long tutorId, @Param("subjectId") Long subjectId);
    
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.tutor.id = :tutorId AND c.isRead = false AND c.senderType = 'STUDENT'")
    Long countUnreadMessagesForTutor(@Param("tutorId") Long tutorId);
    
    @Query("SELECT COUNT(c) FROM ChatMessage c WHERE c.student.id = :studentId AND c.isRead = false AND c.senderType = 'TUTOR'")
    Long countUnreadMessagesForStudent(@Param("studentId") Long studentId);
    
    @Query("SELECT c FROM ChatMessage c WHERE c.tutor.id = :tutorId AND c.isRead = false AND c.senderType = 'STUDENT' ORDER BY c.createdAt DESC")
    List<ChatMessage> findUnreadMessagesForTutor(@Param("tutorId") Long tutorId);
    
    @Query("SELECT DISTINCT c.subject FROM ChatMessage c WHERE c.tutor.id = :tutorId AND c.isRead = false AND c.senderType = 'STUDENT'")
    List<Subject> findSubjectsWithUnreadMessagesForTutor(@Param("tutorId") Long tutorId);
}