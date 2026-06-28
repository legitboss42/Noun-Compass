# Phase 8 Title and Description Audit

Last updated: 2026-06-26

## Summary

Metadata coverage is strong, but quality is uneven. The largest issue is overlong article titles and descriptions in research-heavy authority pages, especially NELFUND, Results, TMA, and Study Centre pages. Static-route quality is materially better after the Phase 8 title cleanup.

## Findings

| Page | Issue | Severity | Reason | Recommended Fix |
| --- | --- | --- | --- | --- |
| `/` | Homepage title was generic before Phase 8 | Fixed | It communicated brand tone but not enough search intent | Fixed: title now leads with NOUN student-guide intent |
| `/tools` | Tools title was generic before Phase 8 | Fixed | `Student Tools` was too broad | Fixed: title now specifies NOUN |
| `/admission`, `/portal`, `/results`, `/examinations`, `/study-centres`, `/gst`, `/student-guides` | Category titles were generic before Phase 8 | Fixed | Titles did not consistently lead with NOUN or the actual search task | Fixed with NOUN-specific category titles |
| `noun-elearn-and-tma-guide` | Title too long | High | Strong editorial title but poor SERP compactness | Add a shorter dedicated SEO title later |
| `how-to-check-noun-results` | Title too long | High | Accurate but likely truncates badly | Add a shorter dedicated SEO title later |
| `is-noun-eligible-for-nelfund` | Title too long | High | Trust framing is good but title is overpacked | Add a shorter dedicated SEO title later |
| Multiple `noun-study-centres-*` pages | Titles too long | High | Local intent is strong but titles exceed practical display limits | Add shorter city-first SEO titles later |
| Multiple NELFUND pages | Descriptions too long | High | Strong nuance, but too verbose for standard snippet length | Add shorter dedicated SEO descriptions later |
| Multiple Results pages | Descriptions too long | Medium | Useful context, but snippet may truncate heavily | Add shorter dedicated SEO descriptions later |
| About / Contact / Policy pages | Titles are concise but plain | Low | Functional, not CTR-focused | Acceptable for non-commercial trust pages |

## Quality Verdict

- Static-page metadata quality: strong after Phase 8 fixes
- Article metadata quality: structurally strong, length discipline still mixed
- Main next-step improvement: support frontmatter-level `seoTitle` and `seoDescription` fields for long authority articles rather than forcing the visible H1 to do both jobs
