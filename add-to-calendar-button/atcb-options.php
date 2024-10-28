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
  private $hook_suffix;
  private $plugin_title = 'Add to Calendar Button';

  public function __construct() {
    add_action( 'admin_menu', array( $this, 'atcb_settings_add_plugin_page' ) );
    add_action( 'admin_init', array( $this, 'atcb_settings_page_init' ) );
    add_action( 'in_admin_header', [ $this, 'atcb_settings_header' ] );
    add_action( 'admin_footer_text', [ $this, 'atcb_settings_footer_text' ] );
  }

  public function atcb_settings_add_plugin_page() {
    $this->hook_suffix = add_options_page(
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
    $configProLink = '<a href="https://docs.add-to-calendar-pro.com/' . $language . 'integration/wordpress.html" target="_blank" rel="noopener">docs.add-to-calendar-pro.com/' . $language . 'integration/wordpress</a>';
    $proLink = 'https://add-to-calendar-pro.com/' . $language;
    $is_pro = isset($this->options['atcb_pro_active']) && ($this->options['atcb_pro_active'] === 'true' || $this->options['atcb_pro_active'] === true) ? true : false;
    ?>
    <div class="wrap atcb-settings-wrap">
      <h2 class="screen-reader-text"><?php esc_html_e( $this->plugin_title ); ?></h2>
      <p><?php echo __("This page holds global settings for Add to Calendar stuff.", 'add-to-calendar-button') ?></p>
      <?php if ( $is_pro === true ) { ?>
        <p>          
          <?php echo __("Find our integration documentation at", 'add-to-calendar-button') ?>:<br />
          <?php echo $configProLink ?>
        </p>
      <?php } else { ?>
        <p>
          <?php echo __("Check our PRO offering for the best experience and less trouble.", 'add-to-calendar-button') ?><br />
          <?php 
            printf(
              __("Without PRO, you would need to configure all options right at the button - check %s for available options.", 'add-to-calendar-button'),
              $configLink)
          ?>
        </p>
      <?php } ?>
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
    <?php if ( $is_pro === false ) { ?>
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
      'atcb_pro_active', // id
      __("PRO User", 'add-to-calendar-button'), // title
      array( $this, 'atcb_pro_active_callback' ), // callback
      'atcb-settings-admin', // page
      'atcb_settings_setting_section' // section
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
    if ( isset( $input['atcb_pro_active'] ) ) {
			$sanitary_values['atcb_pro_active'] = $input['atcb_pro_active'];
		}
		if ( isset( $input['atcb_go_unstyle'] ) ) {
			$sanitary_values['atcb_go_unstyle'] = $input['atcb_go_unstyle'];
		}
		return $sanitary_values;
	}

	public function atcb_settings_section_info() {
		
	}

  public function atcb_pro_active_callback() {
		printf(
			'<input type="checkbox" name="atcb_global_settings[atcb_pro_active]" id="atcb_pro_active" value="true" %s> <label for="atcb_pro_active">' . __("I am a PRO user. Hide the ads for it.", 'add-to-calendar-button') . '</label>',
			( isset( $this->options['atcb_pro_active'] ) && ($this->options['atcb_pro_active'] === 'true' || $this->options['atcb_pro_active'] === true) ) ? 'checked' : ''
		);
	}

	public function atcb_go_unstyle_callback() {
		printf(
			'<input type="checkbox" name="atcb_global_settings[atcb_go_unstyle]" id="atcb_go_unstyle" value="true" %s> <label for="atcb_go_unstyle">' . __("This will use a smaller version of the script.", 'add-to-calendar-button') . '</label>',
			( isset( $this->options['atcb_go_unstyle'] ) && ($this->options['atcb_go_unstyle'] === 'true' || $this->options['atcb_pro_active'] === true) ) ? 'checked' : ''
		);
    echo '<p class="atcb_disclaimer">(' . __("Mind that elements will not be styled, if activated! You would need to use the customCss option to style them; or (if using the PRO version) activate the \"Load Async\" option at respective styles.", 'add-to-calendar-button') . ')</p>';
	}

  public function atcb_settings_header() {
    $screen = get_current_screen();
    if ( $this->hook_suffix === $screen->id ) {
      $locale = get_Locale();
      $language = explode( '_', $locale )[0];
      $supportedLanguages = ['en', 'de'];
      if ($language == 'en' or !in_array($language, $supportedLanguages)) {
        $language = '';
      } else {
        $language .= '/';
      }
      $this->options = get_option( 'atcb_global_settings' );
      $is_pro = isset($this->options['atcb_pro_active']) && ($this->options['atcb_pro_active'] === 'true' || $this->options['atcb_pro_active'] === true) ? true : false;
      $service_links = [
        [
          'url'    => 'https://wordpress.org/support/plugin/add-to-calendar-button/',
          'title'  => __( 'Support', 'add-to-calendar-button' ) . ' ↗',
          'target' => '_blank',
          'icon'   => '<span class="dashicons dashicons-editor-help"></span> ',
        ],
        [
          'url'    => 'https://wordpress.org/support/plugin/add-to-calendar-button/reviews/#new-post',
          'title'  => __( 'Review', 'add-to-calendar-button' ) . ' ↗',
          'target' => '_blank',
          'icon'   => '<span class="dashicons dashicons-star-filled"></span> ',
        ],
      ];
      ?>
      <div class="atcb-settings-header">
        <div>
          <h1>Add to Calendar: <?php echo __("Settings", 'add-to-calendar-button') ?></h1>
          <?php 
          if ( $is_pro === true ) {
            echo '<i><strong>' . __("PRO User", 'add-to-calendar-button') . '</strong></i>';
          } else {
            echo '<a href="https://add-to-calendar-pro.com/' . $language . '" target="_blank" rel="noopener">' . __("Go PRO", 'add-to-calendar-button') . ' ↗</a>';
          }
          ?>
        </div>
        <div>
          <?php foreach ( $service_links as $link ) : ?>
          <?php printf( '<a href="%1$s" target="%3$s">%4$s%2$s</a>', $link['url'], $link['title'], $link['target'], $link['icon'] ); ?>
          <?php endforeach; ?>
          </div>
      </div>
      <?php
    }
  }

  public function atcb_settings_footer_text( $footer_text ) {
    $current_screen = get_current_screen();
    if ( $this->hook_suffix === $current_screen->id ) {
      $footer_text = '<i><strong>' . esc_html__( $this->plugin_title ) . '</strong> <code>' . ATCB_PLUGIN_VERSION . '</code>. Please <a target="_blank" href="https://wordpress.org/support/plugin/add-to-calendar-button/reviews/#new-post" title="Rate the plugin" style="text-decoration:none">rate the plugin <span style="color:#ffb900">★★★★★</span></a> to keep the wheels turning. Thank you!</i>';
    }
    return $footer_text;
  }

}

if (is_admin()) $atcb_settings_page = new ATCBSettingsPage();

?>