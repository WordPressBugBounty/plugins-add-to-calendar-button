<?php
/**
 * This File is part of the Plugin 'Add to Calendar Button' (https://add-to-calendar-button.com)
 * Create RSVP forms and beautiful buttons, where people can add events to their calendars.
 *
 * Author: Jens Kuerschner
 * Author URI: https://add-to-calendar-pro.com
 *
 */

/*
This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 3
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

Mind that while this plugin is licensed under the GPLv3 licsense,
the underlying script to generate the buttons is licensed under
the  Elastic License 2.0 (ELv2). They are compatible for regular
use, but you are not allowed to rework the core script and 
provide the product (generating an add-to-calendar-button) to 
others as a managed service.
*/

defined('ABSPATH') or die("No script kiddies please!");

class ATCBSettingsPage {
  private $options;

  public function __construct() {
    add_action( 'admin_menu', array( $this, 'atcb_settings_add_plugin_page' ) );
    add_action( 'admin_init', array( $this, 'atcb_settings_page_init' ) );
  }

  public function atcb_settings_add_plugin_page() {
    add_options_page(
      'Add to Calendar Settings', 
      'Add to Calendar', 
      'manage_options', 
      'add-to-calendar-setting', 
      array( $this, 'atcb_settings_create_admin_page' )
    );
  }
  
  public function atcb_settings_create_admin_page() {
    $this->options = get_option( 'atcb_global_settings' );
    $locale = get_Locale();
    $language = explode( '_', $locale )[0];
    $supportedLanguages = ['en', 'de'];
    if ($language == 'en' or !in_array($language, $supportedLanguages)) {
      $language = '';
    } else {
      $language .= '/';
    }
    $configLink = '<a href="https://add-to-calendar-button.com/' . $language . 'configuration" target="_blank" rel="noopener">add-to-calendar-button.com/' . $language . 'configuration</a>';
    $proLink = 'https://add-to-calendar-pro.com/' . $language;
    ?>
    <div class="wrap">
      <h2>Add to Calendar Settings</h2>           
      <p><?php echo __("This page holds global settings for Add to Calendar stuff.", 'add-to-calendar-button') ?></p>
      <p>
        <?php echo __("Check our PRO offering for the best experience and less trouble.", 'add-to-calendar-button') ?><br />
        <?php 
          printf(
            __("Without PRO, you would need to configure all options right at the button - check %s for available options.", 'add-to-calendar-button'),
            $configLink)
        ?>
      </p>
      <p>&nbsp;</p>
      <p>&nbsp;</p>
      <form method="post" action="options.php">
        <?php
          settings_fields( 'atcb_global_settings_group' );
          do_settings_sections( 'atcb-settings-admin' );
          submit_button();
        ?>
      </form>
    </div>
    <div id="atcb-pro-banner">
      <div>
        <div class="atcb-pro-img">
          <img alt="Get started" width="800" height="928" src="<?php echo plugins_url('rocket.webp', __FILE__) ?>" />
        </div>
        <div class="atcb-pro-text">
          <div>
            <h2><?php echo __("Discover the PRO offering", 'add-to-calendar-button') ?></h2>
            <p><?php echo __("More functionality (like RSVP) and way less trouble thanks to managed ics file hosting, no-code customization, and more.", 'add-to-calendar-button') ?></p>
          </div>
          <a target="_blank" rel="noopener" href="<?php echo $proLink ?>"><?php echo __("Learn more", 'add-to-calendar-button') ?></a>
        </div>
      </div>
    </div>
    <?php
  }

  public function atcb_settings_page_init() {        
    register_setting(
      'atcb_global_settings_group', // option_group
      'atcb_global_settings', // option_name
      array( $this, 'atcb_settings_sanitize' ) // sanitize_callback
    );

    add_settings_section(
      'atcb_settings_setting_section', // id
      __("Settings", 'add-to-calendar-button') . ':', // title
      array( $this, 'atcb_settings_section_info' ), // callback
      'atcb-settings-admin' // page
    );

    add_settings_field(
      'atcb_go_unstyle', // id
      __("Load script unstyled", 'add-to-calendar-button'), // title
      array( $this, 'atcb_go_unstyle_callback' ), // callback
      'atcb-settings-admin', // page
      'atcb_settings_setting_section' // section
    );
  }

  public function atcb_settings_sanitize($input) {
		$sanitary_values = array();
		if ( isset( $input['atcb_go_unstyle'] ) ) {
			$sanitary_values['atcb_go_unstyle'] = $input['atcb_go_unstyle'];
		}
		return $sanitary_values;
	}

	public function atcb_settings_section_info() {
		
	}

	public function atcb_go_unstyle_callback() {
		printf(
			'<input type="checkbox" name="atcb_global_settings[atcb_go_unstyle]" id="atcb_go_unstyle" value="true" %s> <label for="atcb_go_unstyle">' . __("This will use a smaller version of the script.", 'add-to-calendar-button') . '</label>',
			( isset( $this->options['atcb_go_unstyle'] ) && $this->options['atcb_go_unstyle'] === 'true' ) ? 'checked' : ''
		);
    echo '<p class="atcb_disclaimer">(' . __("Mind that elements will not be styled, if activated! You would need to use the customCss option to style them; or (if using the PRO version) activate the \"Load Async\" option at respective styles.", 'add-to-calendar-button') . ')</p>';
	}

}

if (is_admin()) $atcb_settings_page = new ATCBSettingsPage();

?>