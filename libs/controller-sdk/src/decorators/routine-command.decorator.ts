import { Injectable } from '@nestjs/common';

export function RoutineCommand(): ClassDecorator {
  return function (target) {
    Injectable()(target);
  };
}
