insert into public.question_banks (course_code, course_title, exam_mode, description, source_url, status)
values
  ('GST101', 'Use of English and Communication Skills I', 'e-exam', 'Original reviewed practice for reading, vocabulary, sentence structure, and communication.', 'https://nou.edu.ng/coursewarecontent/GST%20101.pdf', 'draft'),
  ('GST102', 'Use of English and Communication Skills II', 'e-exam', 'Original reviewed practice for writing, paragraphs, communication, and language use.', 'https://nou.edu.ng/coursewarecontent/GST%20102.pdf', 'draft'),
  ('GST107', 'A Study Guide for the Distance Learner', 'e-exam', 'Original reviewed practice for distance learning, planning, active reading, and self-assessment.', 'https://nou.edu.ng/coursewarecontent/GST%20107%20October%202018_docx.pdf', 'draft'),
  ('GST201', 'Nigerian Peoples and Culture', 'e-exam', 'Original reviewed practice for culture, diversity, social institutions, and development.', 'https://nou.edu.ng/coursewarecontent/GST%20201%20%20NIGERIAN%20PEOPLES%20AND%20CULTURE.pdf', 'draft'),
  ('GST302', 'Business Creation and Growth', 'mixed', 'Original reviewed practice for opportunity recognition, business models, finance, and growth.', 'https://nou.edu.ng/coursewarecontent/GST%20302%20.pdf', 'draft')
on conflict (course_code) do update set
  course_title = excluded.course_title,
  exam_mode = excluded.exam_mode,
  description = excluded.description,
  source_url = excluded.source_url;
