# @automagical/terminal

> Primary consuming application: Dashboard

## Purpose

This library is responsible for managing library code that relates to full screen terminal interactions.
Currently, this library acts as a binding layer between Blessed, and this repository that provides assistance to the dashboard app.

The overall goal of this library is to provide all the interactions needed for full screen rendering inside of a terminal.

## Future goals

In the long term, this library is intended to fully replace the Blessed library.
Unfortunately, that library is no longer being supported, the typescript definitions are frequently wrong, and much of the functionality still needs a helping hand.

The end goal will be to have a DI friendly terminal rendering library that takes inspiration from Blessed
