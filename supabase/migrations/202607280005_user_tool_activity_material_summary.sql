alter table public.user_tool_activity
  drop constraint if exists user_tool_activity_tool_key_check;

alter table public.user_tool_activity
  add constraint user_tool_activity_tool_key_check
  check (tool_key in ('fee-checker', 'cgpa-calculator', 'study-planner', 'result-checker', 'material-summary'));
