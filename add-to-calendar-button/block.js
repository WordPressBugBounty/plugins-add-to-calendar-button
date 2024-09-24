// Import necessary WordPress packages
import { InspectorControls } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { createElement } from '@wordpress/element';
import { ToggleControl, TextControl, TextareaControl } from '@wordpress/components';
import Select from 'react-select';

// Retrieve the language and settings from the global object
const allowedFields = window.atcbSettings.allowedAttributes;
const atcbDefaultTimeZone = window.atcbSettings.defaultTimeZone;
const atcbDefaultTitle = window.atcbSettings.defaultTitle;
const atcbLanguage = window.atcbI18nObj.language;

// attributes to be added to the button within the editor mode
const atcbEditorAttr = {
	debug: true,
	blockInteraction: true,
};

// calendar types
const selectOptions = [
	{ label: 'Apple', value: 'apple' },
	{ label: 'Google', value: 'google' },
	{ label: 'iCal', value: 'ical' },
	{ label: 'Microsoft 365', value: 'ms365' },
	{ label: 'Outlook.com', value: 'outlookcom' },
	{ label: 'Microsoft Teams', value: 'msteams' },
	{ label: 'Yahoo', value: 'yahoo' },
];

// preparing a dynamic date in the future for the default values
const atcbDefaultDate = (function () {
	const today = new Date();
	const nextDay = new Date();
	nextDay.setDate( today.getDate() + 3 );
	return nextDay.getFullYear() +
	'-' +
	( '0' + ( nextDay.getMonth() + 1 ) ).slice( -2 ) +
	'-' +
	( '0' + nextDay.getDate() ).slice( -2 );
})();

// defining the default event strings
const atcbDefaultLanguage = ( function () {
	const supportedLanguages = ['en', 'de', 'nl', 'fa', 'fr', 'es', 'et', 'pt', 'tr', 'zh', 'ar', 'hi', 'pl', 'ro', 'id', 'no', 'fi', 'sv', 'cs', 'ja', 'it', 'ko', 'vi'];
	if ( atcbLanguage != 'en' && atcbLanguage != '' && supportedLanguages.includes(atcbLanguage) ) {
		return ' language="' + atcbLanguage + '"';
	}
	return '';
} )();

// defining a language slug for external websites
const atcbLanguageSlug = ( function () {
	const supportedLanguages = ['en', 'de'];
	if ( atcbLanguage != 'en' && atcbLanguage != '' && supportedLanguages.includes(atcbLanguage) ) {
		return atcbLanguage + '/';
	}
	return '';
} )();

// defining a custom icon for the block
const atcbIconEl = createElement(
	'svg',
	{
		width: 24,
		height: 24,
		viewBox: '0 0 24 24',
	},
	createElement( 'path', {
		d: 'm14.626 4.6159c0-0.33981 0.33589-0.61587 0.75122-0.61587s0.75122 0.27606 0.75122 0.61587v2.6977c0 0.33981-0.33589 0.61587-0.75122 0.61587s-0.75122-0.27606-0.75122-0.61587zm-0.47524 9.8989c0.2383 0 0.43228 0.19398 0.43228 0.43228 0 0.2383-0.19398 0.43228-0.43228 0.43228l-1.686-0.0052-0.0052 1.6835c0 0.2383-0.19398 0.43228-0.43228 0.43228-0.2383 0-0.43228-0.19398-0.43228-0.43228l0.0052-1.6847-1.6835-0.0065c-0.2383 0-0.43228-0.19398-0.43228-0.43228 0-0.2383 0.19398-0.43228 0.43228-0.43228l1.6847 0.0052 0.0052-1.6835c0-0.2383 0.19398-0.43228 0.43228-0.43228s0.43228 0.19398 0.43228 0.43228l-0.0052 1.686zm-6.2951-9.8989c0-0.33981 0.33597-0.61587 0.7513-0.61587s0.75122 0.27606 0.75122 0.61587v2.6977c0 0.33981-0.33589 0.61587-0.75122 0.61587s-0.75122-0.27606-0.75122-0.61587zm-3.0218 5.2847h14.332v-3.1052c0-0.10415-0.04296-0.19918-0.11199-0.2695-0.06903-0.069034-0.16407-0.11199-0.2695-0.11199h-1.3736c-0.23046 0-0.4166-0.18614-0.4166-0.4166s0.18614-0.4166 0.4166-0.4166h1.3736c0.33461 0 0.63795 0.13671 0.85801 0.35677 0.22006 0.22006 0.35669 0.52332 0.35669 0.85793v11.99c0 0.33461-0.13671 0.63795-0.35677 0.85801-0.22006 0.22006-0.5234 0.35677-0.85801 0.35677h-13.569c-0.33461 0-0.63795-0.13671-0.85801-0.35677-0.22006-0.22134-0.35677-0.52476-0.35677-0.85937v-11.989c0-0.33461 0.13671-0.63795 0.35677-0.85801s0.5234-0.35677 0.85801-0.35677h1.4673c0.23046 0 0.4166 0.18614 0.4166 0.4166s-0.18614 0.4166-0.4166 0.4166h-1.4673c-0.10415 0-0.19918 0.042956-0.2695 0.11199-0.069034 0.069034-0.11199 0.16407-0.11199 0.2695zm14.332 0.83457h-14.332v8.0488c0 0.10415 0.042956 0.19918 0.11199 0.2695 0.069034 0.06903 0.16407 0.11199 0.2695 0.11199h13.569c0.10415 0 0.19918-0.04296 0.2695-0.11199 0.06903-0.06903 0.11199-0.16407 0.11199-0.2695zm-8.5996-4.3212c-0.23046 0-0.4166-0.18614-0.4166-0.4166s0.18614-0.4166 0.4166-0.4166h2.7979c0.23046 0 0.4166 0.18614 0.4166 0.4166s-0.18614 0.4166-0.4166 0.4166z',
		strokeWidth: '.079993',
	} )
);

// global function to parse the input
function atcbParseAttributes( name, options, others, prokey, isPro = false ) {
	// parse attributes from "others"
	const pattern = /([\w]+)(?:\s?=\s?)?(?:"([^"]+)"|'([^']+)')?/g;
	let match;
	const attributes = {};
	while ( ( match = pattern.exec( others ) ) !== null ) {
		// parsing the attributes, except for unkown attribute, which cannot be used and would even throw an error in some cases (e.g. style)
		if ( match[1] !== undefined && allowedFields.includes(match[1].toLowerCase()) ) {
			if ( match[3] ) {
				attributes[ match[1] ] = match[3];
			} else if ( match[2] ) {
				attributes[ match[1] ] = match[2];
			} else {
				attributes[ match[1] ] = "true";
			}
		}
	}
	// for description, dates, and customLabels, we replace any [ with { and any ] with } to avoid conflicts with the shortcode
	if ( attributes[ 'description' ] !== undefined ) {
		attributes[ 'description' ] = attributes[ 'description' ].replace( /\[/g, '{' ).replace( /\]/g, '}' );
	}
	if ( attributes[ 'dates' ] !== undefined ) {
		// for dates, we also need to make sure the JSON stays valid
		attributes[ 'dates' ] = attributes[ 'dates' ].replace( /\[/g, '{' ).replace( /\]/g, '}' ).replace( /^{{/, '{' ).replace( /}}$/, '}' );

	}
	if ( attributes[ 'customLabels' ] !== undefined ) {
		attributes[ 'customLabels' ] = attributes[ 'customLabels' ].replace( /\[/g, '{' ).replace( /\]/g, '}' );
	}
	// validating whether prokey, name, and options are already set and only take the explicit fields, if not
	if ( isPro && attributes[ 'prokey' ] === undefined && prokey && prokey !== '' ) {
		// only add if valid UUID
		if ( prokey.match( /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}/ ) ) {
			attributes[ 'prokey' ] = prokey;
		}
	}
	if (!isPro) {
		if ( attributes[ 'name' ] === undefined && name && name !== '' ) {
			attributes[ 'name' ] = name;
		}
		if ( attributes[ 'options' ] === undefined && options) {
			if ( Array.isArray(options) ) {
				attributes[ 'options' ] = "'" + options.join( "','" ) + "'";
			} else {
				attributes[ 'options' ] = "'" + options.replace( /,/g, "','" ) + "'";
			}
		}
	}
	return attributes;
}

// the actual block generation magic
registerBlockType( 'add-to-calendar/button', {
	title: 'Add to Calendar Button',
	icon: atcbIconEl,
	category: 'widgets',
	keywords: [ 'Button', 'Event', 'Link', window.atcbI18nObj.keywords.k1, window.atcbI18nObj.keywords.k2, window.atcbI18nObj.keywords.k3, window.atcbI18nObj.keywords.k4 ],
	description: window.atcbI18nObj.description,
	textdomain: 'add-to-calendar-button',
	attributes: {
		isPro: {
			type: 'boolean',
			default: false,
		},
		prokey: {
			type: 'string',
			default: '',
		},
		name: {
			type: 'string',
			default: atcbDefaultTitle,
		},
		options: {
			type: 'array',
			default: ['apple','google','ical','outlookcom','ms365','yahoo'],
		},
		content: {
			type: 'string',
			default: `startDate="${ atcbDefaultDate }"\ntimeZone="${ atcbDefaultTimeZone }"${ atcbDefaultLanguage }`,
			},
	},
	edit: function ( props ) {
		const { attributes, setAttributes } = props;
		// Select component for the options
		const MyMultiSelect = ({ options, value, onChange }) => {
			return (
				<Select
					id='atcb-options'
					isMulti
					isSearchable={false}
					options={options}
					value={value}
					onChange={onChange}
				/>
			);
		};
		// Function to update the 'isPro' attribute
    const onTogglePro  = ( newValue ) => {
			setAttributes( { isPro: newValue } );
		};
		// check the "others" input for name, prokey, and options and copy them to the respective attributes
		function atcbCheckForSingleFieldsInOthers(content = '') {
			if ( content === '' ) {
				content = attributes.content;
			}
			const inputContentAttributes = atcbParseAttributes( null, null, content );
			if ( inputContentAttributes[ 'name' ] && inputContentAttributes[ 'name' ] !== '' && !attributes.isPro ) {
				setAttributes( { name: inputContentAttributes[ 'name' ] } );
			}
			if ( inputContentAttributes[ 'prokey' ] && inputContentAttributes[ 'prokey' ] !== '' && attributes.isPro ) {
				setAttributes( { prokey: inputContentAttributes[ 'prokey' ] } );
			}
			if ( inputContentAttributes[ 'options' ] && inputContentAttributes[ 'options' ] !== '' && !attributes.isPro ) {
				const optionsInput = inputContentAttributes[ 'options' ].replace( /[\['"\]]/g, '' ).toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, '').split( ',' );
				setAttributes( { options: optionsInput } );
			}
		}
		// update attributes on change
		const atcbUpdateProKey  = ( newValue ) => {
			setAttributes( { prokey: newValue } );
		};
		function atcbUpdateName( newValue ) {
			setAttributes( { name: newValue } );
		}
		function atcbUpdateOptions( event ) {
			const newValues = event.map(option => option.value);
      setAttributes( { options: newValues } );
		}
		function atcbUpdateOtherParams( newValue ) {
			setAttributes( { content: newValue } );
			atcbCheckForSingleFieldsInOthers(newValue);
		}
		// build the form
		return [
			createElement(
				InspectorControls,
				{},
				createElement(
					'div',
					{ style: { padding: '10px' } },
					createElement( ToggleControl, {
						label: 'PRO',
						checked: attributes.isPro,
						onChange: onTogglePro
					})
				),
				attributes.isPro ?
					createElement(
						'div',
						{},
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextControl, {
								label: 'ProKey',
								value: attributes.prokey,
								onChange: atcbUpdateProKey
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextareaControl, {
								label: window.atcbI18nObj.label_override,
								value: attributes.content,
								rows: 5,
								onChange: atcbUpdateOtherParams
							}),
							createElement(
								'div',
								{ style: { paddingBottom: '20px' } },
								window.atcbI18nObj.override_note
							)
						)
					)
				:
					createElement(
						'div',
						{},
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextControl, {
								label: window.atcbI18nObj.label_name,
								value: attributes.name,
								onChange: atcbUpdateName
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( 'label', {
								for: 'atcb-options',
								style: { fontSize: '11px', fontWeight: 500, lineHeight: 1.4, textTransform: 'uppercase', display: 'inline-block', marginBottom: '8px', padding: 0 }
							}, window.atcbI18nObj.label_options),
							createElement( MyMultiSelect, {
								options: selectOptions,
								value: attributes.options.map(option => selectOptions.find(o => o.value === option.toLowerCase().replace(/microsoft/g, 'ms').replace(/\s|\./g, ''))), // replacement for better backwards compatibility
								onChange: atcbUpdateOptions
							})
						),
						createElement(
							'div',
							{ style: { padding: '10px' } },
							createElement( TextareaControl, {
								label: window.atcbI18nObj.label_others,
								value: attributes.content,
								rows: 5,
								onChange: atcbUpdateOtherParams
							}),
							createElement(
								'div',
								{ style: { paddingBottom: '20px' } },
								createElement(
									'a',
									{
										target: '_blank',
										href: 'https://add-to-calendar-button.com/' + atcbLanguageSlug + 'configuration',
									},
									window.atcbI18nObj.help
								)
							)
						)
					),
				createElement(
					'div',
					{
						style: {
							padding: '10px 10px 15px',
							fontWeight: '600',
							fontStyle: 'italic',
						},
					},
					window.atcbI18nObj.note + '!'
				)
			),
			createElement( 'add-to-calendar-button', {
				...atcbEditorAttr,
				...atcbParseAttributes( attributes.name, attributes.options, attributes.content, attributes.prokey, attributes.isPro ),
			} ),
		];
	},
	save: function ( props ) {
		const { attributes } = props;
    const tagAttributes = atcbParseAttributes( attributes.name, attributes.options, attributes.content, attributes.prokey, attributes.isPro );
    // construct the shortcode string
    let shortcode = `[add-to-calendar-button`;
    // add attributes
		Object.keys(tagAttributes).forEach(key => {
			if (tagAttributes[key]) {
				// replace any quotes with &quot; to avoid conflicts with the shortcode
				tagAttributes[key] = tagAttributes[key].replace(/"/g, '&quot;');
				shortcode += ` ${key}="${tagAttributes[key]}"`;
			}
		});
    shortcode += `]`;
    return shortcode;
	},
} );
