import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentsNotesComponent } from './students-notes.component';

describe('StudentsNotesComponent', () => {
  let component: StudentsNotesComponent;
  let fixture: ComponentFixture<StudentsNotesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentsNotesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentsNotesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
