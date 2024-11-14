SELECT DISTINCT
    l.id AS user_id,
    l.email AS user_email,
    l.aid AS user_aid,
    e.id AS email_id,
    e.name AS email_name,
    es.date_sent,
    es.date_read,
    ph.url AS clicked_url,
    ph.date_hit AS date_clicked

FROM `email_stats` es
JOIN `leads` l ON l.id = es.lead_id
JOIN `emails` e ON e.id = es.email_id
JOIN `page_hits` ph ON ph.lead_id = l.id
WHERE ph.source = 'email'
AND ph.source_id = e.id
AND ph.date_hit FROM 2024-10-01 TO 2024-10-31
AND ph.redirect_id IN (7,15,24,37,46,56,65,73,79,85,91,97,103,109,117,123,171,178,184,191,198,207,214,222,232,241,250,258,265,273,280,286,294,301,308,315,322,329,336,343,350,356,363,370,378,385,392,398,405,419,426,433,517,523,565,571,592,599,606,668,716,723,859,1040) 
GROUP BY l.id, e.id, es.date_sent, es.date_read, ph.url ;