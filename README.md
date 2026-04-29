# CS208 Full Stack Final Project
### By Gabriel Kendall

## Starting the project.

To set up the database, run the `install_db.sh` script. This script will install
MariaDB and start the server running. You only need to run this script once per
Codespace.


```bash
./setup_scripts/install_db.sh
```

Use the following for questions that the script asks:

- Switch to unix_socket authentication [Y/n] n
- Change the root password? [Y/n] Y
  - Set the password to 12345
- Remove anonymous users? [Y/n] Y
- Disallow root login remotely? [Y/n] Y
- Remove test database and access to it? [Y/n] Y
- Reload privilege tables now? [Y/n] Y

Test to make sure the db is running:

```bash
sudo service mariadb status
```

You should see something similar to what is shown below.
```
* /usr/bin/mariadb-admin  Ver 10.0 Distrib 10.11.13-MariaDB, for debian-linux-gnu on x86_64
Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Server version          10.11.13-MariaDB-0ubuntu0.24.04.1
Protocol version        10
Connection              Localhost via UNIX socket
UNIX socket             /run/mysqld/mysqld.sock
Uptime:                 10 min 23 sec

Threads: 1  Questions: 90  Slow queries: 0  Opens: 33  Open tables: 26  Queries per second avg: 0.144
```

Create the initial tables:

```bash
sudo mysql -u root -p < ./setup_scripts/create_table.sql
```

Check to make sure the tables were created correctly
```bash
mysql -u root -p -e 'show databases;'
```

```
Enter password:
+--------------------+
| Database           |
+--------------------+
| cs208demo          |
| information_schema |
| mysql              |
| performance_schema |
| sys                |
+--------------------+
```

Install NPM on within your codespace.
Run the following commands to set up the project:

```bash
npm install
npm start
```

## Design Decisions
- I wanted to have the logo within a top Banner and have some suplamental information in a Footer. This make the content feel enclosed and as if it wer eemphesised abd important.
- Every text should be centered on the page for ease of viewing. This also is were the eye is naturally drawn when opening a page. The sides of the page are not used to limit necessary eye movment.
- Line dividers were used to separate information within the pages, unless enough of a gap was sufficient. Lines were not used on the menu as it would feel more rigid and less homey. They were however used on the contacts page to form distink sections.
- Each piece of information is separated in some way, and the images have rounded corners to reduce overall page harshness.

## Edge Cases
- If the input is not a string
    - It is converted to an empty value so the app doesn’t crash.
- If Special/HTML characters appear in the input
    - It is cleaned to prevent unsafe content from being displayed or injected.
- Repetitive or spam-like text
    - Rejected to prevent low-quality or spam comments.
- Very short comments
    - Rejected if they are too short to be meaningful.
- Missing name or comment
    - Rejected and user is asked to fill in both fields.
- Comment has >15 repeated characters, or has <3 unique characters
    - Rejected with a message asking for a better comment.
- Name too long
    - Rejected to keep input within allowed limits.
- Comment too long
    - Rejected to prevent overly large submissions.
- Invalid or missing page number
    - Defaults to page 1 to keep pagination valid.
- No comments in database
    - Page still loads normally with an empty state, and displays that no comments exist.
- Error counting comments in database
    - Shows an error message instead of breaking.
- Error loading comments list
    - Page loads with a fallback and error message.
- Unexpected error when loading reviews page
    - Caught and handled with a general error message.
- Error saving a comment
    - Comment is not saved and user is notified.
- Unexpected error when submitting a comment
    - Handled safely with an error message.
- Error clearing the comments table
    - Operation fails safely and user is informed.
- Unexpected error when clearing comments
    - Caught and handled with a general error message.

## Challenges & Learnings
- It was challenging to draw the Logo without a starter file, and as i did not know how to just import an svg into the page, I started with writing individual coordinate lines and arcs and positioning the text with CSS. I have since moved to using an SVG file for the graphic, but have included my old version for frame of referance.
- Getting the phone implementation to work was quite a pain. I will admit that i used AI to clean up my messy code after i got it working. It was quite the jumble of code.
- The database was also hard to wrap my hear around. I am use to using Java, which was my first language, so not having instantiated static variables was tricky.
