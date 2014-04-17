'use strict';

var defineError = require('faulty');

var SubModelNotFound          = defineError('SubModelNotFound');
var AssociationTypeMismatch   = defineError('AssociationTypeMismatch');
var SerializationTypeMismatch = defineError('SerializationTypeMismatch');
var RecordNotFound            = defineError('RecordNotFound');
var RecordNotSaved            = defineError('RecordNotSaved');
var RecordNotDestroyed        = defineError('RecordNotDestroyed');
var PreparedStatementInvalid  = defineError('PreparedStatementInvalid');
var ReadOnlyRecord            = defineError('ReadOnlyRecord');
var Rollback                  = defineError('Rollback');
var DangerousAttributeError   = defineError('DangerousAttributeError');
var ImmutableRelation         = defineError('ImmutableRelation');
var TransactionIsolationError = defineError('TransactionIsolationError');
var StrictValidationFailed    = defineError('StrictValidationFailed');

var StatementInvalid = defineError('StatementInvalid', function(_, originalError) {
  this.originalError = originalError;
});

var RecordInvalid = defineError('RecordInvalid', function(_, record) {
  this.record = record;
});

var RecordNotUnique = defineError('RecordNotUnique', function(_, originalError) {
  this.originalError = originalError;
});

var InvalidForeignKey = defineError('InvalidForeignKey', function(_, originalError) {
  this.originalError = originalError;
});

var UnknownAttributeError = defineError('UnknownAttributeError', function(_, record, attribute) {
  this.record = record;
  this.attribute = attribute;
});

var AttributeAssignmentError = defineError('AttributeAssignmentError', function(_, exception, attribute) {
  this.exception = exception;
  this.attribute = attribute;
});

var MultiparameterAssignmentErrors = defineError('MultiparameterAssignmentErrors', function(_, errors) {
  this.errors = errors;
});

var UnknownPrimaryKey = defineError('UnknownPrimaryKey', function(_, model) {
  this.model = model;
});

module.exports = {
  SubModelNotFound:               SubModelNotFound,
  AssociationTypeMismatch:        AssociationTypeMismatch,
  SerializationTypeMismatch:      SerializationTypeMismatch,
  RecordNotFound:                 RecordNotFound,
  RecordNotSaved:                 RecordNotSaved,
  RecordNotDestroyed:             RecordNotDestroyed,
  StatementInvalid:               StatementInvalid,
  RecordInvalid:                  RecordInvalid,
  RecordNotUnique:                RecordNotUnique,
  InvalidForeignKey:              InvalidForeignKey,
  PreparedStatementInvalid:       PreparedStatementInvalid,
  ReadOnlyRecord:                 ReadOnlyRecord,
  Rollback:                       Rollback,
  DangerousAttributeError:        DangerousAttributeError,
  UnknownAttributeError:          UnknownAttributeError,
  AttributeAssignmentError:       AttributeAssignmentError,
  MultiparameterAssignmentErrors: MultiparameterAssignmentErrors,
  UnknownPrimaryKey:              UnknownPrimaryKey,
  ImmutableRelation:              ImmutableRelation,
  TransactionIsolationError:      TransactionIsolationError,
  StrictValidationFailed:         StrictValidationFailed
};
