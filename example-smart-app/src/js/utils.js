var utils = (function ()
{
    'use strict';

    var result =
    {
        getValueOrDefault: function (value, defaultValue, allowNull)
        {
            if (typeof value != 'undefined' && (value != null || allowNull == true))
            {
                return value;
            }

            if (typeof defaultValue == 'undefined')
            {
                log('Default value is undefined and should not be, will return null', 1);
                return null;
            }

            return defaultValue;
        },
        guid: function()
        {
            function s4()
            {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
    };
    return result;

})();
