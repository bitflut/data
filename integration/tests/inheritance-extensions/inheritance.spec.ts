import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgxsDataPluginModule } from '@ngxs-labs/data';
import { DataAction, StateRepository } from '@ngxs-labs/data/decorators';
import { NgxsImmutableDataRepository } from '@ngxs-labs/data/repositories';
import { NGXS_DATA_EXCEPTIONS } from '@ngxs-labs/data/tokens';
import { NgxsModule, State, Store } from '@ngxs/store';

describe('Inheritance', () => {
    it('should be throw', () => {
        try {
            abstract class CountRepo extends NgxsImmutableDataRepository<number> {
                // @ts-ignore
                @DataAction() public increment;
            }

            @Injectable()
            @StateRepository()
            @State({
                name: 'count',
                defaults: 0
            })
            class CountState extends CountRepo {}

            TestBed.configureTestingModule({
                imports: [NgxsModule.forRoot([CountState])]
            });
        } catch (e) {
            expect(e.message).toEqual(NGXS_DATA_EXCEPTIONS.NGXS_DATA_ACTION);
        }
    });

    it('should be correct with inheritance', () => {
        abstract class CountRepo extends NgxsImmutableDataRepository<number> {
            @DataAction()
            public decrement(): void {
                this.ctx.setState((state) => --state);
            }
        }

        @Injectable()
        @StateRepository()
        @State({
            name: 'count',
            defaults: 0
        })
        class CountState extends CountRepo {
            @DataAction()
            public increment(): void {
                this.ctx.setState((state) => ++state);
            }
        }

        TestBed.configureTestingModule({
            imports: [NgxsModule.forRoot([CountState]), NgxsDataPluginModule.forRoot()]
        });

        const store: Store = TestBed.get<Store>(Store);
        const count: CountState = TestBed.get<CountState>(CountState);

        expect(store.snapshot()).toEqual({ count: 0 });
        expect(count.getState()).toEqual(0);

        count.increment();
        count.decrement();
        count.increment();

        expect(store.snapshot()).toEqual({ count: 1 });
        expect(count.getState()).toEqual(1);
    });
});
