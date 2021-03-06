# -*- encoding: utf-8 -*-

import datetime, time
from decimal import Decimal
from django.utils.encoding import smart_str

def getTypedValue (sAux , sType):
    """ Retorna valores tipados segun el tipo definido 
    * se usa sobre todo para las UDP y los JsonField 
    """

    if sAux == 'None':
        sAux = ''
    sAux = smart_str(sAux)

    if sType == 'bool':
        sAux = toBoolean(sAux)
    elif sType in ([ 'int', 'autofield', 'foreignid' ]):
        sAux = toInteger(sAux)
    elif sType == 'decimal':
        sAux = toDecimal(sAux)
    elif sType == 'date':
        sAux = toDate(sAux)
    elif sType == 'datetime':
        sAux = toDateTime(sAux)
    elif sType == 'time':
        sAux = toTime(sAux)
    elif sType == 'foreigntext':
        if sAux == 'None':
            sAux = ''

    return sAux


def isNumeric(s):
    try:
        i = float(s)
    except ValueError, TypeError:
        return False
    else:
        return True


def toInteger(s, iDefault=None):
    """
    Conversion a entero,  utilizada antes de cargar la Db 
    """
    try:
        iResult = int(s)
        return iResult
    except :
        return iDefault


def toFloat(s, iDefault=None):
    """
    Conversion a float,  utilizada antes de cargar la Db 
    """
    try:
        iResult = float(s)
        return iResult
    except :
        return iDefault


def toDecimal(s , iDefault=None):
    """
    Conversion a decimal,  utilizada antes de cargar la Db 
    """
    try:
        iResult = Decimal(s)
        return iResult
    except :
        return iDefault



def toBoolean(s):
    """
    Conversion a boolean,  utilizada antes de cargar la Db 
    """
    if type(s).__name__  in ['str', 'unicode']:
        return (s.lower()[0] in ("y", "t", "o", "s", "1"))
    elif type(s).__name__ == 'bool':
        return s
    elif type(s).__name__ == 'int' and s != 0:
        return True
    else:
        return False


def toDate(sVal, iDefault=None):
    sVal = toDateTime(sVal, iDefault)
    if type(sVal).__name__ == 'date':
        return sVal
    elif type(sVal).__name__ == 'datetime':
        return sVal.date()
    return None

def toTime(sVal, iDefault=None):
    sVal = toDateTime(sVal, iDefault)
    if type(sVal).__name__ == 'time':
        return sVal
    elif type(sVal).__name__ == 'datetime':
        return sVal.time()


def toDateTime(sVal, iDefault=None):
    """ Suponer formato Iso OrderingDate 
    """
    if sVal is None:
        return iDefault
    try:
        if sVal.count("T") > 0:
            # IsoFormat DateTime
            (date, time) = sVal.split("T")
            (an, mois, jour) = date.split('-')
            (h, m, s) = time.split(':')
            return datetime.datetime(int(an), int(mois), int(jour), int(h), int(m), int(s))

        elif sVal.count("-") == 2:
            # IsoFormat Date
            (an, mois, jour) = sVal.split('-')
            return datetime.date(int(an), int(mois), int(jour))

        elif sVal.count("/") == 2:
            if sVal.count(' ') > 0:
                (date, time) = sVal.split(" ")
                (jour, mois, an) = date.split('/')
                (h, m, s) = time.split(':')
                return datetime.datetime(int(an), int(mois), int(jour), int(h), int(m), int(s))
            else:
                (jour, mois, an) = sVal.split('/')
                return datetime.date(int(an), int(mois), int(jour))
    except:
        return iDefault


def isinteger(astring):
    if not astring:
        return False
    import string
    for char in str(astring):
        if not char in string.digits:
            return False
    return True
