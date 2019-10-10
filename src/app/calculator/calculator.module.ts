import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalculatorRoutingModule } from './calculator-routing.module';
import { CalculatorComponent } from './calculator/calculator.component';

@NgModule({
    declarations: [CalculatorComponent],
    imports: [
        CommonModule,
        CalculatorRoutingModule
    ]
})
export class CalculatorModule { }
