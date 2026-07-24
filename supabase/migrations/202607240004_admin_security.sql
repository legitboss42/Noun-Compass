-- Keep internal support notes strictly staff-only. Students can neither read
-- nor create internal notes, even if they craft direct database requests.

drop policy if exists "ticket messages read" on public.support_messages;
create policy "ticket messages read"
on public.support_messages for select to authenticated
using (
  (
    internal_note = false
    and exists (
      select 1
      from public.support_tickets ticket
      where ticket.id = ticket_id
        and (ticket.user_id = auth.uid() or public.is_staff())
    )
  )
  or (
    internal_note = true
    and public.is_staff()
  )
);

drop policy if exists "ticket messages insert" on public.support_messages;
create policy "ticket messages insert"
on public.support_messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and (internal_note = false or public.is_staff())
  and exists (
    select 1
    from public.support_tickets ticket
    where ticket.id = ticket_id
      and (ticket.user_id = auth.uid() or public.is_staff())
  )
);
