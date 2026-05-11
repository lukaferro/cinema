import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilmDetailsComponent } from './movie-details.component';

describe('FilmDetailsComponent', () => {
  let component: FilmDetailsComponent;
  let fixture: ComponentFixture<FilmDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilmDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilmDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
