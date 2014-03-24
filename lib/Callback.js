'use strict';

var Type = require('callbacks').Type;

var Name = {
  INITIALIZE: 'initialize',
  FIND:       'find',
  TOUCH:      'touch',
  VALIDATION: 'validation',
  SAVE:       'save',
  CREATE:     'create',
  UPDATE:     'update',
  DESTROY:    'destroy'
};

var Kind = {
  AFTER_INITIALIZE:   { type: Type.AFTER,   name: Name.INITIALIZE },
  AFTER_FIND:         { type: Type.AFTER,   name: Name.FIND       },
  AFTER_TOUCH:        { type: Type.AFTER,   name: Name.TOUCH      },

  BEFORE_VALIDATION:  { type: Type.BEFORE,  name: Name.VALIDATION },
  AFTER_VALIDATION:   { type: Type.AFTER,   name: Name.VALIDATION },

  BEFORE_SAVE:        { type: Type.BEFORE,  name: Name.SAVE       },
  AFTER_SAVE:         { type: Type.AFTER,   name: Name.SAVE       },

  BEFORE_CREATE:      { type: Type.BEFORE,  name: Name.CREATE     },
  AFTER_CREATE:       { type: Type.AFTER,   name: Name.CREATE     },

  BEFORE_UPDATE:      { type: Type.BEFORE,  name: Name.UPDATE     },
  AFTER_UPDATE:       { type: Type.AFTER,   name: Name.UPDATE     },

  BEFORE_DESTROY:     { type: Type.BEFORE,  name: Name.DESTROY    },
  AFTER_DESTROY:      { type: Type.AFTER,   name: Name.DESTROY    }
};

module.exports = {
  Name: Name,
  Kind: Kind
};
