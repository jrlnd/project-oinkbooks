# Oinkbooks

[View website](https://jrlnd-projects-oinkbooks.vercel.app/)

Oinkbooks is a simple purchase tracker for visualising and tracking personal expenses to meet financial goals. All you need to do is add your purchase and it will update automatically on the calendar, table and graph.

## Overview

I was inspired to create this web app when I was helping my friend create something similar on a spreadsheet. I've seen lots of different budget/expense trackers before, but
not many of them let you visualise those purchases on a calendar to see a day-by-day analysis.

Creating the calendar was an interesting challenge. I didn't want to rely on any external libraries so I created it from scratch using CSS Grid. For responsive design, the calendar
changes to an agenda-esque view and only shows days that have actual purchases and hides all the empty days.

The table was created with Material UI's data grid. The pro version of the data grid allows for external button actions, so I added my own custom functionality in order to provide
the edit and delete functionality with dialogs.

The pie chart was created with ReCharts JS. I enjoyed using this package in another project so I wanted to continue to use it. Since the data is dynamic, I had to figure out a way to
dynamically assign colors to each category. To solve this, I basically created a function that returns the hex value of specific interval points of a rainbow.

## Tech Stack

- Next.js 14
- Vercel Postgres DB
- Clerk Authentication
- Sentry Error Management
- Posthog Analytics
- Upstash Redis Ratelimiting

## To-Do List

- [x] Make it deploy (vercel)
- [ ] Tidy up build process
- [ ] Scaffold basic ui with mock data
- [ ] Actually setup a database (vercel postgres)
- [ ] Attach database to UI
- [ ] Add authentication (clerk)
- [ ] Add app functionality + server actions
- [ ] Error management (sentry)
- [ ] Analytics (posthog)
- [ ] Ratelimiting (upstash)

## Improvements

TBD
