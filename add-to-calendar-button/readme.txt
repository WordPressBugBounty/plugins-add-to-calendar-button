=== Add to Calendar Button ===
Contributors: add2cal, jekuer
Tags: calendar, button, event, widget, rsvp
Stable tag: 9
Requires at least: 5.7
Requires PHP: 7.4
Tested up to: 6.6
License: GPLv3 or later
License URI: https://www.gnu.org/licenses/gpl-3.0.html

Create beautiful buttons, where people can add events to their calendars. Highly customizable. As shortcode or via a convenient block.

== Description ==

= Make your events get saved. =

This WordPress plugin lets you create beautiful buttons with calendar links, where people can add events to their calendars.

All of this with just a few clicks and highly customizable, using the popular Add to Calendar Button script.

Check out the [official website](https://add-to-calendar-button.com) for a comprehensive demo and overview.

= 🚀 GO PRO =
With the PRO version, you can even go further. Use the same button to let people RSVP to your events - fully managed.

At the same time, setting up and managing Add to Calendar Buttons and events becomes even more convenient.

Learn more at [add-to-calendar-pro.com](https://add-to-calendar-pro.com).

= 🛠️ INTEGRATED IN SECONDS =
You can either use the shortcode [add-to-calendar-button] or the Gutenberg Block.

**With the PRO version, it only takes the ID to make it fly.**

In the no-PRO case, you simply place the necessary attributes directly in the shortcode, or at the Gutenberg Block settings.

(Mind that you cannot use '[' and ']' characters, when going for the shortcode option! For content formatting, you can use {'{'}xxx{'}'} instead of [xxx] there.)

= ✨ SUPPORTED CALENDARS =

* Google Calendar.
* Yahoo Calender.
* Microsoft 365, Outlook, and Teams.
* Automatically generated iCal/ics files (for all other calendars, like Apple).

= 📆 SUPPORTED EVENT TYPES =

* Timed and all-day events.
* One-time, multi-date, recurring.
* Most robust time zone and daylight saving management.
* Dynamic dates (like "today + 3").

= 🎨 ADJUST THE LOOK =

The button comes with multiple themes as well as a dark and light mode.

You can easily adjust almost every element by setting the respective simple attributes. 
In case you want to go all-in, you can also manipulate all kinds of colors and further styling.

= 🖖 EXPERT ACCESSIBILITY =

* Optimized and adjustable UX (for desktop and mobile).
* Dynamic dropdown positioning.
* Taking care of all those edge cases, where some scenarios do not support specific setups (like WebView blocking downloads); utilizing beautiful user guidance workarounds.
* Auto-generated Schema.org rich (structured) data for better SEO.
* Full support for mouse, touch, or keyboard input (W3C WAI compliant).
* Aside from the WordPress editor, the button itself supports 20+ languages, incl. RTL text for Arabic; but also offers the option to customize all labels and text blocks.

= 📄 ABOUT THE LICENSE =

Mind that the script to actually generate the Add to Calendar Button uses the [Elastic License 2.0 (ELv2)](https://github.com/add2cal/add-to-calendar-button/blob/main/LICENSE.txt)!

This usually comes with no restrictions for you, but it forbids you to rework the core script and provide the product (generating an add-to-calendar-button) to others as a managed service.

In almost every case, this will not affect you. If you are not sure, because you are building some kind of SaaS, where you are using the plugin, simply contact us.

== Installation ==

Simply install the plugin via the usual WordPress process - either via the admin panel or by downloading and uploading it.

After the installation, you need to activate the plugin as usual by clicking the respective trigger at your plugins page.

That's it. You can now use it via the shortcode [add-to-calendar-button] or the Gutenberg Block (simply search for it).

== Frequently Asked Questions ==

= Is it free? =

Yes! You can use it completely free of charge.

The only minor limitation is, that you are not allowed to rework the plugin to somehow sell the generation of the buttons as managed service.

In doubt, simply ask us 🙂.

= How can I configure the button? =

Have a look at the [official documentation by clicking here](https://add-to-calendar-button.com/configuration).

If you go for the PRO version, you would configure everything directly in the Add to Calendar PRO app, while you only need to provide the so called "proKey" in the shortcode or block.

= Can I connect it to meta fields, ACF, or other plugins? =

When using our PRO offering, you can do so!

You would create an event with just any data at our app, link it via its ProKey and then be able to link the core data fields with your meta fields, ACF fields, or shortcodes.

When using the Block, the setup at WordPress is quite straightforward by setting the "Dynamic Date Override" option. When using our shortcode, you would need to use the "data" attribute to link the data fields. The following attributes are available:

* startdate ("YYYY-MM-DD")
* starttime ("HH:MM")
* enddate ("YYYY-MM-DD")
* endtime ("HH:MM")
* startdatetime ("YYYY-MM-DDTHH:MM" or "YYYY-MM-DD HH:MM")
* enddatetime ("YYYY-MM-DDTHH:MM" or "YYYY-MM-DD HH:MM")
* name
* description
* location
* timezone

Prepend with mf-* if you want to link to a meta field, acf-* for ACF fields, and sc-* if you want to use a shortcode. Like "acf-startdate" or "sc-name".

At the event on Add to Calendar PRO, consider setting it to "private". This way, you do not risk to have conflicting data. The only data that is synced in this case, would be style information or advanced date stuff like recurrence.

= Can I adjust the look of the button? =

Yes, you can.

First of all, there are a lot of easy to access options for the most common cases, documented at the [official documentation](https://add-to-calendar-button.com/configuration).

In case you want to go even further with customizing the look of the Add to Calendar Button, you have multiple expert options. They are described in detail at the [advanced usage section of the documentation](https://add-to-calendar-button.com/advanced-use).

= Does it also come with RSVP forms? =

If you are signed up for the PRO version, you can transform any button into an RSVP form with one click from the Add to Calendar PRO app.

Without this PRO version, unfortunately, you cannot use this feature.

= I have a problem. How can I get help? =

You can always use the WordPress [support forum](https://wordpress.org/support/plugin/add-to-calendar-button/).

If the problem is not related to the WordPress integration, but rather the button's functionality, you might also want to consider posting it at the official GitHub repository to reach a bigger audience.

* [Click here for the official discussion board - for Q&A](https://github.com/add2cal/add-to-calendar-button/discussions)
* [Click here, if you want to file a bug report](https://github.com/add2cal/add-to-calendar-button/issues)

== Screenshots ==

1. Add to Calendar Buttons can be used as Blocks, which enables you to directly see how it will look like on the final website.
2. Add to Calendar Buttons can take all kinds of styles.

== Changelog ==
= 2.4 =
* ⚠️ Attention: old override settings will get lost on update and block recovery as we are now using a more robust override system for PRO buttons
* New option to dynamically link data to meta fields, ACF, or shortcodes (PRO only)
* Showing open seats on RSVP
* Optimized subscription handling as Google Calendar App on Android does no longer support subscribing to a url atm
* Better organizer email validation
* securing regex and date parsing optimization
* Bug Fixes

= 2.3 =
* supporting shortcode inside the shortcode for attribute values
* preparing for WordPress 6.5
* dropping default image for schema.org
* add default eventStatus to rich data
* all kinds of css fixes

= 2.2 =
* new option useUserTZ
* adding css ::part support
* adding support for formatting inside a url at description

= 2.1 =
* ⚠️ Attention: dropdown now available for date style button (also acting as new default)
* ⚠️ Attention: fixing schema.org default image (set option to "[]" to disable)
* dropping iOS non-Safari workaround for givenIcsFile
* style optimization
* new css variables, like customizable font-weight

= 2.0 =
* updating add-to-calendar-button script to v2.5.4
* ✨ introducing Add to Calendar PRO
* better calendar option select
* more stable flow
* settings page
* ⚠️ Attention: default branding activated in order to support this free open source project (if you do not want to support this project, use the hideBranding option to disable it)

= 1.6 =
* preparing for WordPress 6.4
* supporting WordPress' new native async loading of scripts

= 1.5 =
* security patch, preventing any injection of malicious code into the shortcode
* please update!
* there is only an immediate risk for you, if you allow untrusted users to create content on your site. But updating doesn't hurt anyway.

= 1.4 =
* updating add-to-calendar-button script to v2.4.1, enabling forceOverlay feature

= 1.3 =
* moved name and options out of the attributes input. Select multiple in the list by holding the ctrl key. Alternatively, you can still overwrite it with the "others" field
* making it more robust against other plugins using similar names

= 1.2 =
* updating add-to-calendar-button script  to v2.2
* new "attendee" option
* better lazy loading of external css
* fixing language issues

= 1.1 =
* updating add-to-calendar-button script  to v2.1
* Romanian language support

= 1.0 =
* initial release with add-to-calendar-button script v2.0

== Upgrade Notice ==

= 1.2 =
* new "attendee" option
* better lazy loading of external css

= 1.1 =
* Romanian language support

= 1.0 =
* initial release.

--------

[See the detailled changelog for the underlying script here](https://github.com/add2cal/add-to-calendar-button/blob/main/CHANGELOG.md)
