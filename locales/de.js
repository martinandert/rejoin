// The translations in this file can be added with:
//   counterpart.registerTranslations('de', require('rejoin/locales/de');

module.exports = {
  rejoin: {
    errors: {
      format: '%(attribute)s %(message)s',

      messages: {
        inclusion:                'ist kein gültiger Wert',
        exclusion:                'ist reserviert',
        invalid:                  'ist ungültig',
        confirmation:             'muss mit %(attribute)s übereinstimmen',
        accepted:                 'muss akzeptiert werden',
        empty:                    'darf nicht leer sein',
        blank:                    'muss ausgefüllt werden',
        present:                  'darf nicht ausgefüllt werden',
        too_long:                 'ist zu lang (höchstens %(count)s Zeichen)',
        too_short:                'ist zu kurz (mindestens %(count)s Zeichen)',
        wrong_length:             'muss eine Länge %(count)s Zeichen haben',
        not_a_number:             'ist keine Zahl',
        not_an_integer:           'muss eine ganze Zahl sein',
        greater_than:             'muss größer als %(count)s sein',
        greater_than_or_equal_to: 'muss größer oder gleich %(count)s sein',
        equal_to:                 'muss gleich %(count)s sein',
        less_than:                'muss kleiner als %(count)s sein',
        less_than_or_equal_to:    'muss kleiner oder gleich %(count)s sein',
        other_than:               'darf nicht gleich %(count)s sein',
        odd:                      'muss eine ungerade Zahl sein',
        even:                     'muss eine gerade Zahl sein'
      }
    }
  }
};
