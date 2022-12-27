( function( $ ) {
    $.fn.conditionize = function( options ) {

        // Set options. NOTE: Replace undefined with 'false'
        // Visit https://stackoverflow.com/q/33017148/5055891 for more information
        if ( options && options.hasOwnProperty( "ifFalse" ) && ( options.ifFalse === undefined ) ) {
            options.ifFalse = false;
        }
        if ( options && options.hasOwnProperty( "ifTrue" ) && ( options.ifTrue === undefined ) ) {
            options.ifTrue = false;
        }
        var settings = $.extend( {

            // Array of events on which to update condition
            updateOn: "change",

            // Update on page load
            onload: true,

            // Set actions for condition states
            // Set value to any of: false / null / '' / 'ignore' / []
            // if you want to ignore the state.  Otherwise set value to
            // * a sting (key for built-in actions in $.fn.conditionize.actions)
            // * a function like function($section) {...}
            // * or an array consisting of strings and/or function described above
            ifTrue: "show",
            ifFalse: "hide"
        }, options );

        // Prepare and validate settings
        if ( Array.isArray( settings.updateOn ) ) {
            settings.updateOn = settings.updateOn.join( " " );
        }
        function prepareActions( actions ) {
            if ( ( !actions ) || ( actions === "ignore" ) ) {
                return [];
            }
            if ( typeof actions === "string" ) {
                actions = [ actions ];
            }
            if ( typeof actions === "function" ) {
                actions = [ actions ];
            }
            if ( Array.isArray( actions ) &&
                 actions.every( function( val ) {
                    return ( ( ( typeof val === "string" ) &&
                               ( $.fn.conditionize.actions.hasOwnProperty( val.split( ":" )[ 0 ] ) )
                             ) ||
                            ( typeof val === "function" ) );
                    } )
                ) {
                return actions;
            }

            throw new TypeError( "Incorrect action type for ifTrue or ifFalse." +
                "ifTrue/ifFalse must be either a string with default action name," +
                "i.e. one of \"show\", \"hide\", \"clear\", \"trigger\" or a function with " +
                "one argument ($section);  or array consisting of them." );
        }
        settings.ifTrue = prepareActions( settings.ifTrue );
        settings.ifFalse = prepareActions( settings.ifFalse );

        // Main handler for a conditional section
        var handler = function( isMet, $section ) {
            var actions;
            if ( isMet ) {
                actions = settings.ifTrue;
            } else {
                actions = settings.ifFalse;
            }

            actions.forEach(
                function( h ) {
                    if ( typeof h === "string" ) {
                        if ( h.substring( 0, 7 ) === "trigger" ) {
                            if ( h === "trigger" ) {
                                $.fn.conditionize.actions.trigger( $section, settings.updateOn );
                            } else {
                                $.fn.conditionize.actions.trigger( $section, h.slice( 8 ) );
                            }
                        } else {
                            $.fn.conditionize.actions[ h ]( $section );
                        }
                    } else {
                        if ( typeof h === "function" ) {
                            h( $section );
                        }
                    }
                }
            );
        };

        return this.each( function() {
            var $section = $( this );
            var cond = $( this ).data( "condition" );
            var allFields = []; // All fields in the condition
            // First get all (distinct) used field/inputs
            cond = cond.replace( $.fn.conditionize.re, function( match, group ) {
                var selector = ( group.substring( 0, 1 ) === "#" ) ?
                    group :
                    "[name='" + group + "']";
                if ( $( selector ).length ) {
                    if ( allFields.indexOf( selector ) === -1 ) {
                        allFields.push( selector );
                    }
                    return "$.fn.conditionize.getValue(\"" + selector + "\")";
                } else {
                    return group;
                }

            } );

            //Set up event listeners
            allFields.forEach( function( field ) {
                $( field ).on( settings.updateOn, function() {
                  handler( eval( cond ), $section );
                } );
            } );

            //Show based on current value on page load
            if ( settings.onload ) {

                // If already loaded
                if ( document.readyState === "complete" ) {
                    handler( eval( cond ), $section );
                } else {
                    $( window ).on( "load", function() {
                        handler( eval( cond ), $section );
                    } );
                }
            }
        } );
    };

    $.extend( $.fn.conditionize, {

        // Prepare a regexp to catch potential field names/ids.
        // Regexp has format like: "(#?[" + allowedNameSymbols + "]+)" + ifNotInQuotes
        re: new RegExp( "(#?[a-z0-9_\\[\\]-]+)" +
            "(?:(?=([^\"]*\"[^\"]*\")*[^\"]*$)(?=([^']*'[^']*')*[^']*$))", "gi" ),

        /**
         * Get value(s) of a field by its selector
         *
         * @param {String} selector A string containing a standard jQuery selector expression
         *
         * @return {(String|Array)} A value of the field or an array values for each field if there are more than one matching inputs
         */
        getValue: function( selector ) {
            var vals;

            // Radio buttons are a special case. They can not be multivalue fields.
            if ( $( selector ).attr( "type" ) === "radio" ) {
                    vals = $( selector + ":checked" ).val();
            } else {
                vals = $( selector ).map( function() {
                    if ( $( this ).attr( "type" ) === "checkbox" ) {
                        return this.checked ? this.value : false;
                    } else {
                        return $( this ).val();
                    }
                } ).get();
                if ( vals.length === 1 ) {
                    vals = vals[ 0 ];
                }
            }
            return vals;
        },

        // Built-in actions
        actions: {
            show: function( $section ) {
                $section.slideDown();
            },
            hide: function( $section ) {
                $section.slideUp();
            },
            clearFields: function( $section ) {
                $section.find( "select, input" ).each( function() {
                    if ( ( $( this ).attr( "type" ) === "radio" ) ||
                         ( $( this ).attr( "type" ) === "checkbox" ) ) {
                        $( this ).prop( "checked", false );
                    } else {
                        $( this ).val( "" );
                    }
                    $( this ).trigger( "change" );
                } );
            },
            trigger: function( $section, events ) {
                events = events.replace( ",", " " );
                events.split( " " ).forEach( function( e ) {
                    $section.trigger( e );
                } );
            }
        }
    } );
} )( jQuery );
