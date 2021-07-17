# Reserved Words

> [Default List](/miscellaneous/variables.html#RESERVED_WORDS)

Reserved words are special keywords that classes like [URLRewriteMiddleware](/classes/UrlRewriteMiddleware.html) use to block off certain keywords from being used by users as project / form / etc names.
Using these words as names can break route parsing, and cause the server to act undesirably. Adding to this list may be desirable if you wish the server to properly parse non-reserved subdomain.

For example, with this url: [https://submission-server.form.io](https://submission-server.form.io)

The **submission-server** subdomain would be identified as a project name alias by default.
Which would cause a lookup failure, if we were intending to use this subdomain to host the submission server container.
To resolve this situation, **submission-server** needs to be added to the reserved words list.
